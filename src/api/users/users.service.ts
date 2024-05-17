import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { SuccessResponse } from '../../utils/response';
import { USERNAME_GENERATOR } from 'src/constant';
import { UsernameGenerator } from 'src/providers/usernameGenerator.provider';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(USERNAME_GENERATOR)
    private readonly usernameGeneratorService: UsernameGenerator,
  ) {}

  /**
   *
   * @param {CreateUserDto} createUserDto Creates a new user profile
   * @returns {Promise<User>} The object of the newly created user
   */
  async create(createUserDto: CreateUserDto) {
    // generate a unique user name from the provided email
    const username = this.usernameGeneratorService.generateUsernameFromEmail(
      createUserDto.email,
    );

    const user = this.userRepository.create({ ...createUserDto, username });

    return await this.userRepository.save(user);
  }

  /**
   * Fetches a user object from the database using the provided ID query
   * @param {string} id -ID of the user being queried for
   * @returns {Promise<SuccessResponse>} Response containing  user object and a success message
   */
  async findOne(id: string) {
    const user = await this.findOneProfile(id);
    return new SuccessResponse(user, 'User retrieved successfully');
  }

  /**
   * Fetches a user object from the database using the provided username query
   * @param {string} username - username of the user being queried for
   * @returns {Promise<User>} Response containing  user object
   */

  async findOneBy(username: string) {
    const user = await this.userRepository.findOneBy({ username });

    if (!user) {
      throw new NotFoundException(
        `User with provided username ${username} does not exist`,
      );
    }

    return user;
  }

  /**
   * Fetches a user object from the database using the provided id query
   * @param {string} id -ID of the user being queried for
   * @returns {Promise<User>} Response containing  user object
   */
  async findOneProfile(id: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }
}
