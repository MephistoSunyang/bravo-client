import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _ from 'lodash';
import moment from 'moment';
import { HTTP_STATUS_CODE_ENUM } from '../enums';
import { IObject, IResult, IToken } from '../interfaces';
import { SessionService } from './session.service';

@Injectable()
export class HttpService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly sessionService: SessionService,
  ) {}

  public getExpiresIn(expiresIn: number) {
    return moment(expiresIn).subtract(5, 'minute').toDate().getTime();
  }

  public createHttpParams(params: IObject): HttpParams {
    let httpParams = new HttpParams();
    _.forIn(params, (value, key) => {
      if (value) {
        httpParams = _.isObject(value)
          ? httpParams.set(key, JSON.stringify(value))
          : httpParams.set(key, _.toString(value));
      }
    });
    return httpParams;
  }

  public async downloadWithToken(url: string, name: string) {
    const token = this.sessionService.get<IToken>('token');
    const headers = new Headers();
    if (token) {
      let accessToken = token.accessToken;
      if (
        Date.now() > this.getExpiresIn(token.accessTokenExpiresIn) &&
        Date.now() < this.getExpiresIn(token.refreshTokenExpiresIn)
      ) {
        const body = {
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
        };
        const result = await this.httpClient
          .put<IResult<IToken>>('auth/v1/token', body)
          .toPromise();
        if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
          this.sessionService.set('token', result.content);
          accessToken = result.content.accessToken;
        }
      }
      headers.append('Authorization', `Bearer ${accessToken}`);
    }
    const anchor = document.createElement('a');
    document.body.appendChild(anchor);
    const blob = await fetch(url, { headers }).then((response) => response.blob());
    const objectUrl = window.URL.createObjectURL(blob);
    anchor.href = objectUrl;
    anchor.download = name;
    anchor.click();
    window.URL.revokeObjectURL(objectUrl);
  }
}
