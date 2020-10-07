import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResult, IToken } from '../interfaces';
import { HttpService, SessionService } from '../services';

@Injectable()
export class AccessTokenInterceptor implements HttpInterceptor {
  constructor(
    private readonly httpService: HttpService,
    private readonly sessionService: SessionService,
  ) {}

  public intercept(request: HttpRequest<IResult>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.sessionService.get<IToken>('token');
    if (
      token &&
      token.accessToken &&
      Date.now() < this.httpService.getExpiresIn(token.accessTokenExpiresIn)
    ) {
      request = request.clone({ setHeaders: { Authorization: `Bearer ${token.accessToken}` } });
    }
    return next.handle(request);
  }
}
