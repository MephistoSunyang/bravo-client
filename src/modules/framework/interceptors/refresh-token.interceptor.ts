import {
  HttpClient,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { HTTP_STATUS_CODE_ENUM, REQUEST_METHOD_ENUM } from '../enums';
import { IResult, IToken } from '../interfaces';
import { HttpService, SessionService } from '../services';

@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly httpService: HttpService,
    private readonly sessionService: SessionService,
  ) {}

  public intercept(request: HttpRequest<IResult>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.sessionService.get<IToken>('token');
    if (!(request.url === 'auth/v1/token' && request.method === REQUEST_METHOD_ENUM.PUT)) {
      if (token) {
        if (
          Date.now() > this.httpService.getExpiresIn(token.accessTokenExpiresIn) &&
          Date.now() < this.httpService.getExpiresIn(token.refreshTokenExpiresIn)
        ) {
          const body = {
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
          };
          return this.httpClient.put<IResult<IToken>>('auth/v1/token', body).pipe(
            map((result) => {
              if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
                this.sessionService.set('token', result.content);
              } else {
                this.sessionService.remove('token');
              }
            }),
            mergeMap(() => next.handle(request)),
          );
        }
      }
    }
    return next.handle(request);
  }
}
