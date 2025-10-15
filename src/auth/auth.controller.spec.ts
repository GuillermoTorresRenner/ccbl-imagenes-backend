import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  refresh: jest.fn(),
};
const mockUsersService = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  updateLastConnection: jest.fn(),
};

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() },
        },
      ],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);
    mockAuthService.register.mockResolvedValue({
      name: 'Test',
      surname: 'User',
      email: 'test@test.com',
      role: 'ADMIN',
    });
    const dto: RegisterDto = {
      email: 'test@test.com',
      password: '12345678',
      name: 'Test',
      surname: 'User',
      role: 'ADMIN',
    };
    const result = await controller.register(dto);
    expect(result).toHaveProperty('message', 'Usuario registrado exitosamente');
    expect(result.user).toHaveProperty('email', 'test@test.com');
  });

  it('should login and set cookies', async () => {
    mockAuthService.login.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    mockUsersService.findByEmail.mockResolvedValue({
      id: '1',
      name: 'Test',
      surname: 'User',
      role: 'ADMIN',
    });
    mockUsersService.updateLastConnection.mockResolvedValue({});
    const req: any = {};
    const res = mockRes();
    const dto: LoginDto = { email: 'test@test.com', password: '12345678' };
    await controller.login(dto, req, res);
    expect(res.cookie).toHaveBeenCalledWith(
      'token',
      'access',
      expect.any(Object),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh',
      expect.any(Object),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Login exitoso' }),
    );
  });

  it('should refresh tokens', async () => {
    mockAuthService.refresh.mockResolvedValue({
      accessToken: 'newaccess',
      refreshToken: 'newrefresh',
    });
    const req: any = { cookies: { refreshToken: 'refresh' } };
    const res = mockRes();
    mockAuthService['jwtService'] = {
      verifyAsync: jest.fn().mockResolvedValue({ id: '1' }),
    };
    await controller.refresh(req, res);
    expect(res.cookie).toHaveBeenCalledWith(
      'token',
      'newaccess',
      expect.any(Object),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'newrefresh',
      expect.any(Object),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token refrescado' });
  });

  it('should logout and clear cookies', async () => {
    const res = mockRes();
    await controller.logout(res);
    expect(res.clearCookie).toHaveBeenCalledWith('token');
    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
    expect(res.json).toHaveBeenCalledWith({ message: 'logout' });
  });
});
