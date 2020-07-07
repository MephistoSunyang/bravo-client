import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _ from 'lodash';
import { FrameworkService, IResult } from '../../framework';
import { MenuModel } from '../models';

@Injectable()
export class MenuService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly frameworkService: FrameworkService,
  ) {}

  public getTreeMenus(menus: MenuModel[], parentId = 0): MenuModel[] {
    return _.chain(menus)
      .filter({ parentId })
      .forEach((menu) => {
        menu.subMenus = this.getTreeMenus(menus, menu.id);
      })
      .orderBy('sort')
      .value();
  }

  public getCurrentUserMenus(groups?: string[]): Promise<IResult<MenuModel[]>> {
    const params = this.frameworkService.httpService.createHttpParams({
      groups,
    });
    return this.httpClient
      .get<IResult<MenuModel[]>>('api/v1/system/menus', { params })
      .toPromise();
  }
}
