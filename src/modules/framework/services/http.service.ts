import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _ from 'lodash';
import { IObject } from '../interfaces';

@Injectable()
export class HttpService {
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
}
