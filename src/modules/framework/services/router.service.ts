import { Injectable } from '@angular/core';
import { NavigationExtras, Router, UrlTree } from '@angular/router';

@Injectable()
export class RouterService {
  constructor(private readonly router: Router) {}

  public encodeUrl(decodeUrl: string): string {
    return encodeURI(decodeUrl);
  }

  public decodeUrl(url: string): string {
    return decodeURI(url);
  }

  public redirect(url: string | UrlTree, extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate([url], extras);
  }
}
