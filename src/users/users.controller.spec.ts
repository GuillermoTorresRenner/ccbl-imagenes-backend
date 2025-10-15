import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUsersService = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  register: jest.fn(),
  updateLastConnection: jest.fn(),
  updateRefreshToken: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();
    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get user by id', async () => {
    mockUsersService.findById.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    });
    const result = await controller.getUser('1');
    expect(result).toHaveProperty('id', '1');
  });

  it('should get user by email', async () => {
    mockUsersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    });
    const result = await controller.getUserByEmail('test@test.com');
    expect(result).toHaveProperty('email', 'test@test.com');
  });
});
