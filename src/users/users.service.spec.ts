import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

const mockPrismaService = {
  users: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user', async () => {
    mockPrismaService.users.create.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    });
    mockPrismaService.users.findUnique.mockResolvedValue(null);
    const dto: CreateUserDto = {
      email: 'test@test.com',
      password: '12345678',
      name: 'Test',
      surname: 'User',
      role: 'ADMIN',
    };
    const result = await service.register(dto);
    expect(result).toHaveProperty('id', '1');
    expect(mockPrismaService.users.create).toHaveBeenCalled();
  });

  it('should find user by id', async () => {
    mockPrismaService.users.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    });
    const result = await service.findById('1');
    expect(result).toHaveProperty('id', '1');
  });

  it('should find user by email', async () => {
    mockPrismaService.users.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    });
    const result = await service.findByEmail('test@test.com');
    expect(result).toHaveProperty('email', 'test@test.com');
  });

  it('should update last connection', async () => {
    mockPrismaService.users.update.mockResolvedValue({
      id: '1',
      lastConnection: new Date(),
    });
    const result = await service.updateLastConnection('1');
    expect(result).toHaveProperty('id', '1');
    expect(mockPrismaService.users.update).toHaveBeenCalled();
  });

  it('should update refresh token', async () => {
    mockPrismaService.users.update.mockResolvedValue({
      id: '1',
      refreshToken: 'token',
    });
    const result = await service.updateRefreshToken('1', 'token');
    expect(result).toHaveProperty('refreshToken', 'token');
    expect(mockPrismaService.users.update).toHaveBeenCalled();
  });
});
