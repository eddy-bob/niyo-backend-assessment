import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  //search through the request meta data for the IS_PUBLIC_KEY key
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // if key exists, skip the jwt validation process and grant permission to access resources
    if (isPublic) {
      return true;
    }
    
    // this calls the the jwt strategy for extra validation if the IS_PUBLIC_KEY key is not found in the request metadata
    return super.canActivate(context);
  }
}
