import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const ip = req.ip;

    const messApi = `${new Date().toLocaleString()} \t ${method} \t ${url} \t ${ip} \t`;

    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`${messApi} ${Date.now() - now}ms`)));
  }
}
