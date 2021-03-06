import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment.local';
import { FrameworkService, HTTP_STATUS_CODE_ENUM, IResult, IToken } from '../../modules/framework';
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
    this.getToken();
  }

  public async getToken() {
    this.isSpinning = true;
    const params = { ticket: this.ticket };
    const result = await this.httpClient
      .get<IResult<IToken>>('auth/v1/token', { params })
      .toPromise();
    this.isSpinning = false;
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.frameworkService.sessionService.set('token', result.content);
      const redirectUrl = this.frameworkService.sessionService.get<string>('redirectUrl');
      if (redirectUrl) {
        this.frameworkService.sessionService.remove('redirectUrl');
      }
      this.frameworkService.routerService.redirect(redirectUrl || environment.homePath);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.GET_TOKEN_FAILED,
      );
    }
  }
}
