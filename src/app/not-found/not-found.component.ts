import { Component } from '@angular/core';
import { environment } from '../../environments/environment.local';
import { FrameworkService } from '../../modules/framework';

@Component({
  templateUrl: './not-found.template.html',
})
export class NotFoundComponent {
  constructor(private readonly frameworkService: FrameworkService) {}

  public goToHome() {
    this.frameworkService.routerService.redirect(environment.homePath);
  }
}
