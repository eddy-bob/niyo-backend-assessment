import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

export interface DatabaseConfig {
  connection: MysqlConnectionOptions['type'];
  url: string;
  host: string;
  port: number;
  name: string;
  username: string;
  password: string;
  synchronize: boolean;
  entities: string;
  charset: string; // Set charset to utf8mb4
  collation: string; // Set collation to utf8mb4_unicode_ci
}

export default () => ({
  nodeEnv: process.env.NODE_ENV,
  appUrl: process.env.APP_URL,
  FrontEndUrl: process.env.FRONT_END_URL,
  port: parseInt(process.env.PORT, 10) || 8080,
  database: {
    connection: process.env.TYPEORM_CONNECTION,
    host: process.env.TYPEORM_HOST,
    port: parseInt(process.env.TYPEORM_PORT, 10) || 3306,
    name: process.env.TYPEORM_DATABASE,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    synchronize: JSON.parse(process.env.TYPEORM_SYNCHRONIZE),
    entities: process.env.TYPEORM_ENTITIES,
    migrations: process.env.TYPEORM_MIGRATIONS,
    migrationsDir: process.env.TYPEORM_MIGRATIONS_DIR,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE,
    refreshSecret: process.env.REFRESH_JWT_SECRET,
    refreshExpiresIn: process.env.REFRESH_JWT_EXPIRE,
    cookieExpire: process.env.JWT_COOKIE_EXPIRE,
  },

  auth: {
    adminPassword: process.env.ADMIN_PASSWORD,
    adminEmail: process.env.ADMIN_EMAIL,
  },
  websocket: {
    port: process.env.SOCKET_PORT,
  },
});
