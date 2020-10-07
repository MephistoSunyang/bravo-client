import { Component } from '@angular/core';
import { FrameworkService } from '../../modules/framework';

@Component({
  templateUrl: './unauthorized.template.html',
})
export class UnauthorizedComponent {
  constructor(private readonly frameworkService: FrameworkService) {}

  public goToLogin() {
    this.frameworkService.routerService.goToLogin();
  }
}
