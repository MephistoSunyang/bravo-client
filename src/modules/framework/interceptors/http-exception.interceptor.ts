import { PlatformLocation } from '@angular/common';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HTTP_STATUS_CODE_ENUM } from '../enums';
import { IResult } from '../interfaces';
import { logger } from '../logger';
import { MessageService, RouterService } from '../services';

@Injectable()
export class HttpExceptionInterceptor implements HttpInterceptor {
  constructor(
    private readonly location: PlatformLocation,
    private readonly messageService: MessageService,
    private readonly routerService: RouterService,
  ) {}

  public intercept(request: HttpRequest<IResult>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          const response: HttpResponse<IResult> = new HttpResponse({
            body: error.error,
            status: HTTP_STATUS_CODE_ENUM.OK,
          });
          logger.error('httpException', error);
          if (request.headers.get('X-Not-Exception') === 'true') {
            return of(response);
          }
          const redirectUrl = this.routerService.encodeUrl(
            `${this.location.pathname}${this.location.search}`,
          );
          switch (error.status) {
            case HTTP_STATUS_CODE_ENUM.BAD_REQUEST:
              if (response.body && response.body.message) {
                this.messageService.error(response.body.message);
                return throwError(response);
              } else {
                return of(response);
              }
            case HTTP_STATUS_CODE_ENUM.UNAUTHORIZED:
              this.routerService.redirect('/unauthorized', { queryParams: { redirectUrl } });
              return throwError(response);
            case HTTP_STATUS_CODE_ENUM.FORBIDDEN:
              this.routerService.redirect('/forbidden', { queryParams: { redirectUrl } });
              return throwError(response);
            case HTTP_STATUS_CODE_ENUM.INTERNAL_SERVER_ERROR:
              this.routerService.redirect('/internalServerError', { queryParams: { redirectUrl } });
              return throwError(response);
            default:
              return of(response);
          }
        }
        return of(error);
      }),
    );
  }
}
