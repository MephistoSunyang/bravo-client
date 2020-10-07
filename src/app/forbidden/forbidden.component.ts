import { Component } from '@angular/core';
import { FrameworkService } from '../../modules/framework';

@Component({
  templateUrl: './forbidden.template.html',
})
export class ForbiddenComponent {
  constructor(private readonly frameworkService: FrameworkService) {}

  public goToLogin() {
    this.frameworkService.routerService.goToLogin();
  }
}
