import { NgModule } from '@angular/core';
import { PreloadAllModules, Route, RouterModule } from '@angular/router';
import { environment } from '../environments/environment.local';
import { AttachmentModule } from '../modules/attachment';
import { SystemModule } from '../modules/system';
import { AuthenticationComponent } from './authentication/authentication.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { HomeComponent } from './home/home.component';
import { InternalServerErrorComponent } from './internal-server-error/internal-server-error.component';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

const routes: Route[] = [
  { path: '', redirectTo: environment.homePath, pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'authentication', component: AuthenticationComponent },
  { path: 'system', loadChildren: () => SystemModule },
  { path: 'system', loadChildren: () => AttachmentModule },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: 'internalServerError', component: InternalServerErrorComponent },
  { path: '**', component: NotFoundComponent },
];

if (environment.production) {
  routes.splice(1, 2);
}

@NgModule({
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
    }),
  ],
})
export class AppRoutesModule {}
