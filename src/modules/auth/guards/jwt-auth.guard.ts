import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { AuthEnum, AUTH_KEY } from 'src/decorators/auth.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    console.log('===========jwt-auth.guard===========');
    const isAuth = this.reflector.getAllAndOverride(AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('isAuth: ', isAuth);
    console.log('===========jwt-auth.guard end===========');

    if (isAuth === AuthEnum.PUBLIC) {
      return true; // Pass authentication
    }

    return super.canActivate(context); // Continue to authentication strat to validate jwt
  }
}
