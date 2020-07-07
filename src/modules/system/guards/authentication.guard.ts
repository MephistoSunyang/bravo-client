import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResult, RouterService, SessionService } from '../../framework';

@Injectable()
export class AuthenticationGuard implements CanActivate, CanActivateChild {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly sessionService: SessionService,
    private readonly routerService: RouterService,
  ) {}

  private authenticationGuard(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    const token = this.sessionService.get<string>('token');
    if (!token) {
      return this.httpClient.get<IResult<string | null>>('/auth/v1/current/token').pipe(
        map((result) => {
          const token = result.content;
          if (!token) {
            const redirectUrl = this.routerService.encodeUrl(state.url);
            this.routerService.redirect('/login', { queryParams: { redirectUrl } });
            return false;
          }
          return true;
        }),
      );
    }
    return of(true);
  }

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    return this.authenticationGuard(route, state);
  }

  public canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    return this.authenticationGuard(route, state);
  }
}
