import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import configuration from './config/configuration';
import { WinstonLoggerService } from './logger/winston-logger/winston-logger.service';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RequestLoggingInterceptor } from './interceptor/request-logging.interceptor';
import { JwtAuthGuard } from './api/auth/guards/jwt-auth.guard';
import { AuthModule } from './api/auth/auth.module';
import { ErrorsInterceptor } from 'src/interceptor/error.interceptor';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TaskModule } from './api/tasks/task.module';
import { UsersModule } from './api/users/users.module';
import { AppGateway } from 'src/app.gateway';
import { APP_GATEWAY } from 'src/constant';
import { Jwt } from './providers/jwt.provider';
import { JWT } from 'src/constant';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configuration],
    }),
    JwtModule.register({
      secret: configuration().jwt.secret,
      signOptions: { expiresIn: configuration().jwt.expiresIn },
    }),
    DatabaseModule,
    AuthModule,
    TaskModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    WinstonLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorsInterceptor,
    },
    {
      provide: JWT,
      useClass: Jwt,
    },
    {
      provide: APP_GATEWAY,
      useClass: AppGateway,
    },
  ],
})
export class AppModule {}
