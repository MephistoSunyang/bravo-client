import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { environment } from '../../environments/environment.local';
import { FrameworkService, HTTP_STATUS_CODE_ENUM, IResult } from '../../modules/framework';
import { NzValidators } from '../../shared';
import { LOGIN_MESSAGE } from './login.message';

@Component({
  templateUrl: './login.template.html',
  styleUrls: ['./login.style.less'],
})
export class LoginComponent implements OnInit {
  public messages = LOGIN_MESSAGE;
  public loginForm: FormGroup;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly frameworkService: FrameworkService,
  ) {}

  private formBuilder(): void {
    this.loginForm = new FormGroup({
      username: new FormControl(null, [NzValidators.required(this.messages.USERNAME_REQUIRED)]),
      password: new FormControl(null, [NzValidators.required(this.messages.PASSWORD_REQUIRED)]),
    });
  }

  public ngOnInit(): void {
    this.formBuilder();
  }

  public async login(): Promise<void> {
    this.frameworkService.formService.validateForm(this.loginForm);
    if (this.loginForm.invalid) {
      return;
    }
    const result = await this.httpClient
      .post<IResult>('auth/v1/accessToken', this.loginForm.value, {
        headers: { 'X-Not-Exception': 'true' },
      })
      .toPromise();
    if (result.code === HTTP_STATUS_CODE_ENUM.CREATED) {
      this.frameworkService.sessionService.set('accessToken', result.content);
      await this.frameworkService.messageService.success(this.messages.LOGIN_SUCCEED);
      const redirectUrl = this.frameworkService.sessionService.get<string>('redirectUrl');
      if (redirectUrl) {
        this.frameworkService.sessionService.remove('redirectUrl');
      }
      this.frameworkService.routerService.redirect(redirectUrl || environment.homePath);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.LOGIN_FAILED,
      );
    }
  }
}
