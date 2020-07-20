import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../shared';
import { AppRoutesModule } from './app-routes.module';
import { AppComponent } from './app.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { HomeComponent } from './home/home.component';
import { InternalServerErrorComponent } from './internal-server-error/internal-server-error.component';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

const modules = [BrowserModule, BrowserAnimationsModule, SharedModule, AppRoutesModule];
const components = [
  AuthenticationComponent,
  ForbiddenComponent,
  HomeComponent,
  InternalServerErrorComponent,
  LoginComponent,
  NotFoundComponent,
  UnauthorizedComponent,
  AppComponent,
];

@NgModule({
  imports: [...modules],
  bootstrap: [AppComponent],
  declarations: [...components],
})
export class AppModule {}
