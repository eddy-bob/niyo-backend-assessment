import { NestFactory } from '@nestjs/core';
import { SeederModule } from './database/seeders/seeder.module';
import { Seeder } from './database/seeders/seeder';

async function bootstrap() {
  NestFactory.createApplicationContext(SeederModule)
    .then((appContext) => {
      const seeder = appContext.get(Seeder);
      let dateString = new Date().toLocaleString();
      console.log(
        `[Seeder] ${process.pid} - ${dateString}    LOG [Seeder] Seeding started`,
      );
      seeder
        .seed()
        .then(() => {
          dateString = new Date().toLocaleString();
          console.log(
            `[Seeder] ${process.pid} - ${dateString}    LOG [Seeder] Seeding completed`,
          );
        })
        .catch((error) => {
          dateString = new Date().toLocaleString();
          console.error(
            `[Seeder] ${process.pid} - ${dateString}    LOG [Seeder] Seeding failed`,
          );
          throw error;
        })
        .finally(() => appContext.close());
    })
    .catch((error) => {
      throw error;
    });
}
bootstrap();
