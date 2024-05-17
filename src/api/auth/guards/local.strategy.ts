import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  // this extracts the email and  password from the request payload
  async validate(email: string, password: string) {
    // validate the user using the email and password
    const user = await this.authService.validateUser(email, password);

    // throw an unauthorized exception if details do not match the existing details in the database
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // add user to the request
    return user;
  }
}
