import { Component } from '@angular/core';
import { environment } from '../../environments/environment.local';
import { RouterService } from '../../modules/framework';

@Component({
  templateUrl: './not-found.template.html',
})
export class NotFoundComponent {
  constructor(private readonly routerService: RouterService) {}

  public goToHome() {
    this.routerService.redirect(environment.index);
  }
}
