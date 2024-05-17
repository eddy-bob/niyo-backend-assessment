import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// this is going to call the local  strategy
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
