import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const mockUsersService = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  register: jest.fn(),
  updateRefreshToken: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should login and return tokens', async () => {
    const user = { id: '1', email: 'test@test.com', password: 'hashed' };
    mockUsersService.findByEmail.mockResolvedValue(user);
    mockJwtService.signAsync
      .mockResolvedValueOnce('access')
      .mockResolvedValueOnce('refresh');
    jest.spyOn(require('bcrypt'), 'compareSync').mockReturnValue(true);
    const result = await service.login({
      email: 'test@test.com',
      password: '12345678',
    });
    expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
      '1',
      'refresh',
    );
  });

  it('should register a user', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);
    mockUsersService.register.mockResolvedValue({
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
    const result = await service.register(dto);
    expect(result).toEqual({
      name: 'Test',
      surname: 'User',
      email: 'test@test.com',
      role: 'ADMIN',
    });
  });

  it('should refresh tokens', async () => {
    const user = { id: '1', refreshToken: 'oldrefresh' };
    mockUsersService.findById.mockResolvedValue(user);
    mockJwtService.verifyAsync.mockResolvedValue(true);
    mockJwtService.signAsync
      .mockResolvedValueOnce('newaccess')
      .mockResolvedValueOnce('newrefresh');
    const result = await service.refresh('1', 'oldrefresh');
    expect(result).toEqual({
      accessToken: 'newaccess',
      refreshToken: 'newrefresh',
    });
    expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
      '1',
      'newrefresh',
    );
  });
});
