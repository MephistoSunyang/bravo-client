import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterService } from '../../modules/framework';

@Component({
  templateUrl: './forbidden.template.html',
})
export class ForbiddenComponent implements OnInit {
  public redirectUrl: string;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly routerService: RouterService,
  ) {}

  public async ngOnInit() {
    this.activatedRoute.queryParams.subscribe((queries) => {
      const { redirectUrl } = queries;
      this.redirectUrl = this.routerService.decodeUrl(redirectUrl);
    });
  }

  public goToLogin() {
    this.routerService.redirect('/login', {
      queryParams: {
        redirectUrl: this.redirectUrl,
      },
    });
  }
}
