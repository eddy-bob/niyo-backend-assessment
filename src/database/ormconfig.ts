import configuration from '../config/configuration';
import { DataSource } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { config as envConfig } from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

envConfig();

const config = configuration();

export const AppDataSource = new DataSource({
  type: config.database.connection as MysqlConnectionOptions['type'] | 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  extra: { charset: 'utf8mb4' },
  synchronize: config.database.synchronize,
  database: config.database.name,
  charset: 'utf8mb4_unicode_ci',
  entities: [config.database.entities],
  migrations: [config.database.migrations],
  namingStrategy: new SnakeNamingStrategy(),
});
