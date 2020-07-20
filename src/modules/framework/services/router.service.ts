import { Injectable } from '@angular/core';
import { NavigationExtras, Router, UrlTree } from '@angular/router';
import { environment } from '../../../environments/environment.local';

@Injectable()
export class RouterService {
  constructor(private readonly router: Router) {}

  public redirect(url: string | UrlTree, extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate([url], extras);
  }

  public goToLogin() {
    window.location.href = environment.loginPath;
  }
}
