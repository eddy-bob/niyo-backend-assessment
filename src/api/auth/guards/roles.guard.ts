import { JwtAuthGuard } from './jwt-auth.guard';
import { ROLES_KEY } from '../../../decorators/roles.decorator';
import { Role } from '../../../types/user';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard extends JwtAuthGuard {
  constructor(private metadataReflector: Reflector) {
    super(metadataReflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await super.canActivate(context);

    if (!isAuthenticated) {
      return false;
    }

    const requiredRoles = this.metadataReflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    return requiredRoles.some((role) => user.role === role);
  }
}
