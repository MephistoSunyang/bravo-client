import { Component } from '@angular/core';
import { environment } from '../../environments/environment.local';
import { RouterService } from '../../modules/framework';

@Component({
  templateUrl: './internal-server-error.template.html',
})
export class InternalServerErrorComponent {
  constructor(private readonly routerService: RouterService) {}

  public goToHome() {
    this.routerService.redirect(environment.index);
  }
}
