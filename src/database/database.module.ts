import { Module } from '@nestjs/common';
import { MysqlDatabaseProviderModule } from './providers/mysql.provider.module';

@Module({
  imports: [MysqlDatabaseProviderModule],
})
export class DatabaseModule {}
