import { NgModule } from '@angular/core';
import { PreloadAllModules, Route, RouterModule } from '@angular/router';
import { environment } from '../environments/environment.local';
import { SystemModule } from '../modules/system';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { HomeComponent } from './home/home.component';
import { InternalServerErrorComponent } from './internal-server-error/internal-server-error.component';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

const routes: Route[] = [
  { path: '', redirectTo: environment.index, pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'system', loadChildren: () => SystemModule },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: 'internalServerError', component: InternalServerErrorComponent },
  { path: '**', component: NotFoundComponent },
];

if (environment.production) {
  routes.splice(2, 2);
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
