import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthEnum, AUTH_KEY } from 'src/decorators/auth.decorator';

import { Role } from '../decorators/auth.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('==========roles.guard==========');
    console.log('excuted on: ', context.getHandler(), context.getClass());

    const requiredRoles = this.reflector.getAllAndOverride<Role[] | AuthEnum>(
      AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    console.log('required roles', requiredRoles);
    console.log('==========roles.guard end==========');

    if (
      requiredRoles === AuthEnum.PUBLIC ||
      requiredRoles === AuthEnum.ANY_ROLE
    )
      return true;
    else {
      const { user } = context.switchToHttp().getRequest();
      return requiredRoles.some((role) => role === user.role);
    }
  }
}
