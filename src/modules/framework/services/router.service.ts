import { Injectable } from '@angular/core';
import { NavigationExtras, Router, UrlTree } from '@angular/router';
import { environment } from '../../../environments/environment.local';
import { SessionService } from './session.service';

@Injectable()
export class RouterService {
  constructor(private readonly router: Router, private readonly sessionService: SessionService) {}

  public redirect(url: string | UrlTree, extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate([url], extras);
  }

  public goToLogin() {
    this.sessionService.remove('token');
    window.location.href = environment.loginPath;
  }
}
