import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment.local';
import { FrameworkService } from '../../framework';

@Injectable()
export class AccessTokenGuard implements CanActivate, CanActivateChild {
  constructor(private readonly frameworkService: FrameworkService) {}

  private accessTokenGuard(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    const token = this.frameworkService.sessionService.get<string>('accessToken');
    if (!token) {
      this.frameworkService.sessionService.set('redirectUrl', state.url);
      this.frameworkService.routerService.goToLogin();
      return of(false);
    }
    return of(true);
  }

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    return this.accessTokenGuard(route, state);
  }

  public canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    return this.accessTokenGuard(route, state);
  }
}
