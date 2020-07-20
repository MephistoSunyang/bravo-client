import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment.local';
import { FrameworkService, HTTP_STATUS_CODE_ENUM, IResult } from '../../modules/framework';
import { AUTHENTICATION_MESSAGE } from './authentication.message';

@Component({
  templateUrl: './authentication.template.html',
  styleUrls: ['./authentication.style.less'],
})
export class AuthenticationComponent implements OnInit {
  public messages = AUTHENTICATION_MESSAGE;
  public ticket = '';
  public isSpinning = false;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly httpClient: HttpClient,
    private readonly frameworkService: FrameworkService,
  ) {}

  public ngOnInit() {
    this.activatedRoute.queryParams.subscribe((queries) => {
      this.ticket = queries.ticket;
    });
    this.getAccessToken();
  }

  public async getAccessToken() {
    this.isSpinning = true;
    const params = { ticket: this.ticket };
    const result = await this.httpClient
      .get<IResult>('auth/v1/accessToken', { params })
      .toPromise();
    this.isSpinning = false;
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.frameworkService.sessionService.set('accessToken', result.content);
      const redirectUrl = this.frameworkService.sessionService.get<string>('redirectUrl');
      if (redirectUrl) {
        this.frameworkService.sessionService.remove('redirectUrl');
      }
      this.frameworkService.routerService.redirect(redirectUrl || environment.homePath);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.GET_ACCESS_TOKEN_FAILED,
      );
    }
  }
}
