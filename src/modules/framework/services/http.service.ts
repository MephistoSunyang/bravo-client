import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _ from 'lodash';
import { IObject } from '../interfaces';
import { SessionService } from './session.service';

@Injectable()
export class HttpService {
  constructor(private readonly sessionService: SessionService) {}

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

  public downloadWithToken(url: string, name: string) {
    const anchor = document.createElement('a');
    document.body.appendChild(anchor);
    const headers = new Headers();
    const accessToken = this.sessionService.get('accessToken');
    headers.append('Authorization', `bearer ${accessToken}`);
    fetch(url, { headers })
      .then((response) => response.blob())
      .then((blobby) => {
        const objectUrl = window.URL.createObjectURL(blobby);
        anchor.href = objectUrl;
        anchor.download = name;
        anchor.click();
        window.URL.revokeObjectURL(objectUrl);
      });
  }
}
