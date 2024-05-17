import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { JwtProvider } from 'src/types/jwt';
import { WsException } from '@nestjs/websockets';
@Injectable()
export class Jwt implements JwtProvider {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  verifyToken = async (token: string) => {
    try {
      const decoded = this.jwtService.verify(
        token,
        this.configService.get('jwt.secret'),
      );
      if (typeof decoded?.sub === 'undefined') {
        throw new WsException('Invalid token');
      }
      return decoded;
    } catch (error) {
      throw new WsException(error.message ? error.message : 'Invalid token');
    }
  };
}
