import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { NzMessageModule } from 'ng-zorro-antd';
import { TokenGuard } from './guards';
import {
  AccessTokenInterceptor,
  HttpExceptionInterceptor,
  HttpLoggerInterceptor,
  HttpTimestampInterceptor,
  RefreshTokenInterceptor,
} from './interceptors';
import { FindPipe, ToBooleanPipe, ToDatePipe, ToSizePipe, ToStringPipe, ToTimePipe } from './pipes';
import {
  FormService,
  FrameworkService,
  HttpService,
  MessageService,
  RouterService,
  StorageService,
} from './services';
import { SessionService } from './services/session.service';

const ngZorroModules = [NzMessageModule];
const modules = [HttpClientModule, ...ngZorroModules];
const pipes = [FindPipe, ToBooleanPipe, ToDatePipe, ToSizePipe, ToStringPipe, ToTimePipe];
const interceptors = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpLoggerInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: HttpTimestampInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: HttpExceptionInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: RefreshTokenInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AccessTokenInterceptor, multi: true },
];
const guards = [TokenGuard];
const services = [
  FormService,
  FrameworkService,
  HttpService,
  MessageService,
  RouterService,
  SessionService,
  StorageService,
];
const providers = [...services, ...guards, ...interceptors];

@NgModule({
  imports: [...modules],
  declarations: [...pipes],
  providers,
  exports: [...modules, ...pipes],
})
export class FrameworkModule {}
