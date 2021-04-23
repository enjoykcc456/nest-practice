import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_DISABLED_KEY } from 'src/decorators/disabled.decorator';

@Injectable()
export class DisableHandlerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handlerFn = context.getHandler();
    const controllerClass = context.getClass();

    const isDisabled = this.reflector.getAllAndOverride<boolean>(
      IS_DISABLED_KEY,
      [handlerFn, controllerClass],
    );

    if (isDisabled === true) {
      throw new HttpException(`This API is disabled.`, HttpStatus.FORBIDDEN);
    }
    return true;
  }
}
