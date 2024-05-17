import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  RequestTimeoutException,
  ServiceUnavailableException,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AxiosError } from 'axios';
import configuration from '../config/configuration';
import { WinstonLoggerService } from '../logger/winston-logger/winston-logger.service';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (
          err.message === 'getaddrinfo ENOTFOUND api.paystack.co' ||
          err.message === 'getaddrinfo EAI_AGAIN api.paystack.co'
        ) {
          return throwError(
            () =>
              new ServiceUnavailableException(
                'Error connecting to Paystack, please try again later.',
              ),
          );
        } else if (err instanceof AxiosError) {
          return throwError(
            () =>
              new HttpException(
                err.response?.data.message,
                err.response?.status,
              ),
          );
        } else if (err.message.includes('timeout')) {
          return throwError(
            () => new RequestTimeoutException('Request timed out'),
          );
        }

        const errorStatus = err.status || 500;
        let errorMessage = err.message || err;
        const IS_PRODUCTION = configuration().nodeEnv === 'production';

        if (IS_PRODUCTION && errorStatus === 500) {
          const logger = new WinstonLoggerService();
          logger.setContext('ErrorsInterceptor');
          logger.error(errorMessage, { stack: err.stack });
          errorMessage =
            'Oops! Something went wrong on our end. Please try again later.';
        }

        return throwError(() => new HttpException(errorMessage, errorStatus));
      }),
    );
  }
}
