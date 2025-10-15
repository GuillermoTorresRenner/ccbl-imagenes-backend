import { RoleGuard } from './role.guard';
import { Reflector } from '@nestjs/core';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new RoleGuard(reflector);
  });

  function createContext(request: any) {
    return {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };
  }

  it('should allow access if no role is required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    const context: any = createContext({});
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if role matches', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);
    const context: any = createContext({ role: 'ADMIN' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if role does not match', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);
    const context: any = createContext({ role: 'USER' });
    expect(() => guard.canActivate(context)).toThrow();
  });
});
