import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResult } from '../interfaces';
import { SessionService } from '../services';

@Injectable()
export class HttpAccessTokenInterceptor implements HttpInterceptor {
  constructor(private readonly sessionService: SessionService) {}

  public intercept(request: HttpRequest<IResult>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.sessionService.get('accessToken');
    if (accessToken) {
      request = request.clone({ setHeaders: { Authorization: `bearer ${accessToken}` } });
    }
    return next.handle(request);
  }
}
