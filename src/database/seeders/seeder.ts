import { Injectable } from '@nestjs/common';
import { UserSeederService } from './users/user.service';

@Injectable()
export class Seeder {
  constructor(private userSeederService: UserSeederService) {}

  async seed() {
    // Seed Users
    await this.users()
      .then((completed) => {
        const dateString = new Date().toLocaleString();
        console.log(
          `[Seeder] ${process.pid} - ${dateString}    LOG [User] Seeding completed`,
        );
        Promise.resolve(completed);
      })
      .catch((error) => {
        const dateString = new Date().toLocaleString();
        console.log(
          `[Seeder] ${process.pid} - ${dateString}    LOG [User] Seeding failed`,
        );
        Promise.reject(error);
      });
  }
  async users() {
    return await this.userSeederService.create();
  }
}
