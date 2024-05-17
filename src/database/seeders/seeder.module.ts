import { Module } from '@nestjs/common';
import { Seeder } from './seeder';
import { UserSeederModule } from './users/user.module';
import { MysqlDatabaseProviderModule } from '../providers/mysql.provider.module';

@Module({
  imports: [MysqlDatabaseProviderModule, UserSeederModule],
  providers: [Seeder],
  exports: [Seeder],
})
export class SeederModule {}
