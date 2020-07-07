import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { NzMessageModule } from 'ng-zorro-antd';
import {
  HttpExceptionInterceptor,
  HttpLoggerInterceptor,
  HttpTimestampInterceptor,
  HttpTokenInterceptor,
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
  { provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: HttpExceptionInterceptor, multi: true },
];
const services = [
  FormService,
  FrameworkService,
  HttpService,
  MessageService,
  RouterService,
  SessionService,
  StorageService,
];
const providers = [...services, ...interceptors];

@NgModule({
  imports: [...modules],
  declarations: [...pipes],
  providers,
  exports: [...modules, ...pipes],
})
export class FrameworkModule {}
