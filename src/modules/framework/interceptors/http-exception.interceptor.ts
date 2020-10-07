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
import { RouterService, SessionService } from '../services';

@Injectable()
export class HttpExceptionInterceptor implements HttpInterceptor {
  constructor(
    private readonly location: PlatformLocation,
    private readonly routerService: RouterService,
    private readonly sessionService: SessionService,
  ) {}

  private upsertRedirectUrl(redirectUrl: string): void {
    if (!this.sessionService.get('redirectUrl')) {
      this.sessionService.set('redirectUrl', redirectUrl);
    }
  }

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
          const redirectUrl = `${this.location.pathname}${this.location.search}`;
          switch (error.status) {
            case HTTP_STATUS_CODE_ENUM.BAD_REQUEST:
              return of(response);
            case HTTP_STATUS_CODE_ENUM.UNAUTHORIZED:
              this.upsertRedirectUrl(redirectUrl);
              this.routerService.redirect('/unauthorized');
              return throwError(response);
            case HTTP_STATUS_CODE_ENUM.FORBIDDEN:
              this.upsertRedirectUrl(redirectUrl);
              this.routerService.redirect('/forbidden');
              return throwError(response);
            case HTTP_STATUS_CODE_ENUM.INTERNAL_SERVER_ERROR:
              this.upsertRedirectUrl(redirectUrl);
              this.routerService.redirect('/internalServerError');
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
