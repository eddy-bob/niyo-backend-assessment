import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsernameGenerator } from 'src/providers/usernameGenerator.provider';
import { USERNAME_GENERATOR } from 'src/constant';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USERNAME_GENERATOR,
      useClass: UsernameGenerator,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
