import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import _ from 'lodash';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment.local';
import { FrameworkService, HTTP_STATUS_CODE_ENUM, IResult, logger } from '../../../framework';
import { MenuModel } from '../../models';
import { LayoutService, MenuService } from '../../services';
import { LAYOUT_MESSAGE } from './layout.message';

@Component({
  selector: 'layout',
  styleUrls: ['./layout.style.less'],
  templateUrl: './layout.template.html',
})
export class LayoutComponent implements OnInit, OnDestroy {
  public messages = LAYOUT_MESSAGE;
  public isSpinning = false;
  public username = '';
  public firstMenu: MenuModel;
  public menus: MenuModel[];
  public refreshMenusSubscription: Subscription;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly frameworkService: FrameworkService,
    private readonly layoutService: LayoutService,
    private readonly menuService: MenuService,
  ) {}

  private getFirstMenu() {
    const firstMenu = new MenuModel();
    firstMenu.name = '主页';
    firstMenu.icon = 'home';
    firstMenu.path = '/system/home';
    this.firstMenu = firstMenu;
  }

  private async getUsername() {
    this.isSpinning = true;
    const result = await this.httpClient
      .get<IResult<string>>('api/v1/system/users/current/username')
      .toPromise();
    this.isSpinning = false;
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.username = result.content;
      logger.info('[username]', this.username);
    } else {
      await this.frameworkService.messageService.error(this.messages.GET_USERNAME_FAILED);
    }
  }

  private async getMenus() {
    this.isSpinning = true;
    const result = await this.menuService.getCurrentUserMenus(['systemAdmin']);
    this.isSpinning = false;
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.menus = this.menuService.getTreeMenus(result.content);
      logger.info('[menus]', this.menus);
    } else {
      await this.frameworkService.messageService.error(this.messages.GET_MENUS_FAILED);
    }
  }

  public ngOnInit() {
    this.getUsername();
    this.getFirstMenu();
    this.getMenus();
    this.refreshMenusSubscription = this.layoutService.refreshMenus.subscribe(() => {
      this.getMenus();
    });
  }

  public ngOnDestroy() {
    this.refreshMenusSubscription.unsubscribe();
  }

  public backHome() {
    this.frameworkService.routerService.redirect(environment.homePath);
  }

  public async logout() {
    this.isSpinning = true;
    const result = await this.httpClient.delete<IResult<string>>('auth/v1/token').toPromise();
    this.isSpinning = false;
    if (result.code === HTTP_STATUS_CODE_ENUM.NO_CONTENT) {
      this.frameworkService.sessionService.remove('token');
      await this.frameworkService.messageService.info(this.messages.LOGOUT_SUCCEED);
      this.frameworkService.routerService.redirect('/login');
    } else {
      await this.frameworkService.messageService.error(this.messages.LOGOUT_FAILED);
    }
  }
}
