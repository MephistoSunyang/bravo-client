import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { REQUEST_METHOD_ENUM } from '../enums';
import { IObject, IResult } from '../interfaces';
import { logger } from '../logger';

@Injectable()
export class HttpLoggerInterceptor implements HttpInterceptor {
  public intercept(request: HttpRequest<IResult>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          const { method } = request;
          logger.debug(`[${method}] ${request.url}`);
          if (method === REQUEST_METHOD_ENUM.GET || request.method === REQUEST_METHOD_ENUM.DELETE) {
            const params: IObject = {};
            request.params.keys().forEach((key) => {
              params[key] = request.params.get(key);
            });
            logger.debug('[params]', params);
          } else if (
            method === REQUEST_METHOD_ENUM.POST ||
            request.method === REQUEST_METHOD_ENUM.PUT ||
            request.method === REQUEST_METHOD_ENUM.PATCH
          ) {
            logger.debug('[body]', request.body);
          }
          logger.debug('[result]', event.body);
        }
      }),
    );
  }
}
