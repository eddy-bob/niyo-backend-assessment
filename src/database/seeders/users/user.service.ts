import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/api/users/entities/user.entity';
import { ADMIN } from './data';
import configuration from 'src/config/configuration';
import { Role } from 'src/types/user';

@Injectable()
export class UserSeederService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create() {
    await this.createAdmin();
  }

  private async createAdmin() {
    const existingAdmin = await this.userRepository.findOne({
      where: {
        email: configuration().auth.adminEmail,
        role: Role.ADMIN,
      },
    });

    // if admin already exists return the existing admin
    if (existingAdmin) {
      return existingAdmin;
    }
    // create a new admin if admin doesnt exist

    const admin = this.userRepository.create({
      ...ADMIN,
      email: configuration().auth.adminEmail,
      password: configuration().auth.adminPassword,
    });

    // return the newly created admin
    return await this.userRepository.save(admin);
  }
}
