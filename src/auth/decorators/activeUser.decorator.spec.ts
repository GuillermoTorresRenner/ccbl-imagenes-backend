import { ActiveUser } from './activeUser.decorator';
import { ExecutionContext } from '@nestjs/common';

describe('ActiveUser Decorator', () => {
  it('should return userID and role from request', () => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({ userID: '1', role: 'ADMIN' }),
      }),
    };
    const result = (ActiveUser as any).factory(
      null,
      mockContext as ExecutionContext,
    );
    expect(result).toEqual({ userID: '1', role: 'ADMIN' });
  });

  it('should return undefined if no userID or role', () => {
    const mockContext: any = {
      switchToHttp: () => ({ getRequest: () => ({}) }),
    };
    const result = (ActiveUser as any).factory(
      null,
      mockContext as ExecutionContext,
    );
    expect(result).toEqual({ userID: undefined, role: undefined });
  });
});
