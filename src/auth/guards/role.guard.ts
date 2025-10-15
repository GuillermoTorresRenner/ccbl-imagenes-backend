import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLE_KEY } from '../decorators/roles.decorator';
import { Roles } from '../roles.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const role = this.reflector.getAllAndOverride<Roles>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!role || role.length === 0 || role === undefined) return true;

    const request = context.switchToHttp().getRequest<Request>();
    if (!role.includes(request['role'])) throw new UnauthorizedException();

    return true;
  }
}
