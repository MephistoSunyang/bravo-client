import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { Observable } from 'rxjs';
import { IResult, IToken } from '../interfaces';
import { SessionService } from '../services';

@Injectable()
export class AccessTokenInterceptor implements HttpInterceptor {
  constructor(private readonly sessionService: SessionService) {}

  private getExpiresIn(expiresIn: number) {
    return moment(expiresIn).subtract(5, 'minute').toDate().getTime();
  }

  public intercept(request: HttpRequest<IResult>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.sessionService.get<IToken>('token');
    if (token && token.accessToken && Date.now() < this.getExpiresIn(token.accessTokenExpiresIn)) {
      request = request.clone({ setHeaders: { Authorization: `Bearer ${token.accessToken}` } });
    }
    return next.handle(request);
  }
}
