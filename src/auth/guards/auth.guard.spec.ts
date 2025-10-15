import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let usersService: any;
  let jwtService: any;

  beforeEach(() => {
    usersService = { findById: jest.fn() };
    jwtService = { verifyAsync: jest.fn() };
    guard = new AuthGuard(usersService, jwtService);
  });

  it('should throw if no token', async () => {
    const context: any = {
      switchToHttp: () => ({ getRequest: () => ({ cookies: {} }) }),
    };
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if token is invalid', async () => {
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({ cookies: { token: 'bad' } }),
      }),
    };
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if user not found', async () => {
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({ cookies: { token: 'token' } }),
      }),
    };
    jwtService.verifyAsync.mockResolvedValue({ id: '1' });
    usersService.findById.mockResolvedValue(null);
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should set userID and role if valid', async () => {
    const req: any = { cookies: { token: 'token' } };
    const context: any = { switchToHttp: () => ({ getRequest: () => req }) };
    jwtService.verifyAsync.mockResolvedValue({ id: '1' });
    usersService.findById.mockResolvedValue({ id: '1', role: 'ADMIN' });
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(req.userID).toBe('1');
    expect(req.role).toBe('ADMIN');
  });
});
