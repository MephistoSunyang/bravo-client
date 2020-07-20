import { Component } from '@angular/core';
import { environment } from '../../environments/environment.local';
import { FrameworkService } from '../../modules/framework';

@Component({
  templateUrl: './internal-server-error.template.html',
})
export class InternalServerErrorComponent {
  constructor(private readonly frameworkService: FrameworkService) {}

  public goToHome() {
    this.frameworkService.routerService.redirect(environment.homePath);
  }
}
