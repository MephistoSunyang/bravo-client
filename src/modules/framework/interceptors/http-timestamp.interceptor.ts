import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { REQUEST_METHOD_ENUM } from '../enums';
import { IResult } from '../interfaces';

@Injectable()
export class HttpTimestampInterceptor implements HttpInterceptor {
  public intercept(request: HttpRequest<IResult>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method === REQUEST_METHOD_ENUM.GET) {
      request = request.clone({ setParams: { timestamp: Date.now().toString() } });
    }
    return next.handle(request);
  }
}
