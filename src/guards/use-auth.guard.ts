import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthEnum, AUTH_KEY, Role } from '../decorators/auth.decorator';

@Injectable()
export class UseAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handlerFn = context.getHandler();
    const controllerClass = context.getClass();

    const isAuth = this.reflector.getAllAndOverride<Role[] | AuthEnum>(
      AUTH_KEY,
      [handlerFn, controllerClass],
    );

    if (isAuth === undefined)
      throw new HttpException(
        `Auth decorator is not set on handler ${handlerFn.name} - ${controllerClass.name}`,
        HttpStatus.NOT_FOUND,
      );

    return true;
  }
}
