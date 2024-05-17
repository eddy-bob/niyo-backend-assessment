import { Injectable } from '@nestjs/common';
import {
  generateFromEmail,
  uniqueUsernameGenerator,
} from 'unique-username-generator';
import {
  UsernameGeneratorInterface,
  Config,
} from 'src/types/usernameGenerator';

@Injectable()
export class UsernameGenerator implements UsernameGeneratorInterface {
  public generateUsernameFromEmail(email: string, random = 2) {
    return generateFromEmail(email, random);
  }
  public generateUniqueUsername(config: Config) {
    return uniqueUsernameGenerator(config);
  }
}
