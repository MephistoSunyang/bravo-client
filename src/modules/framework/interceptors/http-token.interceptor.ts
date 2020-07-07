import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResult } from '../interfaces';
import { SessionService } from '../services';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
  constructor(private readonly sessionService: SessionService) {}

  public intercept(request: HttpRequest<IResult>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.sessionService.get('token');
    if (token) {
      request = request.clone({ setHeaders: { Authorization: `bearer ${token}` } });
    }
    return next.handle(request);
  }
}
