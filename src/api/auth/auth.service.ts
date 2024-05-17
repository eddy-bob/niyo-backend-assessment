import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { SignupUserDto } from './dto/signup.dto';
import { SuccessResponse } from '../../utils/response';
import { JwtPayload } from './guards/jwt.strategy';
import { WinstonLoggerService } from 'src/logger/winston-logger/winston-logger.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: WinstonLoggerService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  /**
   *A method that validates a user information by matching the email and password provided during signin with those stored in db
   * @param {string} email - Email of the use to be validated
   * @param {string} enteredPassword - Password of the user to be validated
   * @returns {Promise<User>} The validate user object
   */
  async validateUser(
    email: string,
    enteredPassword: string,
  ): Promise<User | null> {
    // find a user by the email in the recieved payload and select the password as it isnt selected by default
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();

    // return an empty response if no user is found
    if (!user) {
      return null;
    }

    // validate the password provided if it matches the database already existent in the database for the user found
    const isMatch = await user.matchPassword(enteredPassword);

    // return an empty response if the passwords do not match
    if (!isMatch) {
      return null;
    }

    // destructure the user body selecting every other field except the password field and storing it in the result variable
    const { password, ...result } = user;

    return result as User;
  }

  /**
   * A method that returns a user object by apply the provided query
   * @param {FindOptionsWhere<User>} filter - This is the query with which a user is to be fetched
   * @param { FindOptionsSelect<User>} select - This includes the fields to be selected and returned only from the found user objects
   * @param { FindOptionsRelations<User>} relations - This includes the foreign entities on the user body to be loaded during query
   * @returns {Promise<User>} The user entity found after applying the provided queries
   */
  async findOneUser(
    filter: FindOptionsWhere<User>,
    select?: FindOptionsSelect<User>,
    relations?: FindOptionsRelations<User>,
  ) {
    // find one user profile with the provide queries determining whcih fields to select and which relationships to load
    return await this.userRepository.findOne({
      where: filter,
      select,
      relations,
    });
  }

  /**
   * A post sign in method that runs during signin and signup for generating auth tokens
   * @param {User} user - The user object of the validated user
   * @returns {Promise<Object>} A response containing the access token, refresh token and the user object
   */
  async postSignin(user: User) {
    // compute the payload to be signed as a jwt token
    const payload: JwtPayload = { sub: user.id, role: user.role };

    // delete the password field from the user body for security reasons
    delete user.password;

    // return a response containing the accessToken,refreshToken duly signed using jwt and the user object
    return {
      user,
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    };
  }

  /**
   * A method for signing in
   * @param {User} user  - The user object of the authenticated person
   * @returns {Promise<SuccessResponse>} The success response containing the access token, refresh token and the authenticated user object as well as the success message
   */
  async signin(user: User) {
    const data = await this.postSignin(user);
    return new SuccessResponse(data, 'Signin successful');
  }

  /**
   * A method for creating a new user account
   * @param {SignupUserDto} signupUserDto - The payload containing the details of the new account
   * @returns {Promise<SuccessResponse>} The success response containing the access token, refresh token and the authenticated user object as well as the success message
   */
  async signup(signupUserDto: SignupUserDto) {
    // create a user profile with the provided details in signup payload

    const user = await this.usersService.create(signupUserDto);

    // call the post signin method to return signed access-token and refresh-token
    const data = await this.postSignin(user);

    // return a success response with the returned response from postsignin
    return new SuccessResponse(data, 'Signup successful', HttpStatus.CREATED);
  }

  /**
   * Generates a refresh token and an access token for user authentication when an access token expries
   * @param {string} refreshToken - The refresh token to validate a user's identity
   * @returns {Object} An object containing the authenticated user body, the access token and refresh token newly generated
   */
  async refreshToken(refreshToken: string) {
    let userId: string;

    try {
      // verify the provided refresh token to know if it is a valid jwt token
      const { sub: payloadSub } = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
      userId = payloadSub;
    } catch (error) {
      // throw an error if token isnt valid or expired
      throw new UnauthorizedException('Invalid token');
    }

    // fetch a user profile from id returned from verifying the refresh token
    const user = await this.usersService.findOneProfile(userId);

    // log the user in again generating an access token and a refresh token
    const res = await this.postSignin(user);

    // return the newly generated data
    return new SuccessResponse(res, 'Token refreshed successfully');
  }
}
