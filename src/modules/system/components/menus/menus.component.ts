import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import _ from 'lodash';
import { NzTreeNodeOptions } from 'ng-zorro-antd';
import { NzValidators } from '../../../../shared';
import {
  FrameworkService,
  HTTP_STATUS_CODE_ENUM,
  ICON_NAMES_CONFIG,
  IResult,
  logger,
} from '../../../framework';
import { MenuModel } from '../../models';
import { LayoutService } from '../../services';
import { MENUS_MESSAGE } from './menus.message';

@Component({
  templateUrl: './menus.template.html',
  styleUrls: ['./menus.style.less'],
})
export class MenusComponent implements OnInit {
  public messages = MENUS_MESSAGE;
  public searchMenuForm: FormGroup;
  public menus: (MenuModel & { expand: boolean })[] = [];
  public menuOptions: NzTreeNodeOptions[] = [];
  public menusLoading = false;
  public deletedMenuId = 0;
  public menuModalVisible = false;
  public iconNamesModelVisible = false;
  public iconNames = ICON_NAMES_CONFIG;
  public menuForm: FormGroup;
  public menu: MenuModel | undefined;
  public saveMenuLoading = false;
  public saveMenuDisabled = false;
  public iconOptionsVisible = true;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly frameworkService: FrameworkService,
    private readonly layoutService: LayoutService,
  ) {}

  private searchMenuFormBuilder() {
    this.searchMenuForm = new FormGroup({
      group: new FormControl(null),
      name: new FormControl(null),
    });
  }

  private menuFormBuilder() {
    this.menuForm = new FormGroup({
      group: new FormControl(null, [NzValidators.required(this.messages.GROUP_REQUIRED)]),
      parentId: new FormControl(null),
      sort: new FormControl(null),
      name: new FormControl(null, [NzValidators.required(this.messages.NAME_REQUIRED)]),
      icon: new FormControl(null),
      path: new FormControl(null, [NzValidators.required(this.messages.PATH_REQUIRED)]),
      visible: new FormControl(null),
      comment: new FormControl(null),
    });
    this.menuForm.statusChanges.subscribe((status) => {
      this.saveMenuDisabled = status !== 'VALID';
    });
    this.menuForm.get('parentId')?.valueChanges.subscribe((parentId) => {
      const groupControl = this.menuForm.get('group');
      if (parentId) {
        const parentMenu = _.find(this.menus, { id: _.toNumber(parentId) });
        if (parentMenu) {
          groupControl?.setValue(parentMenu.group);
          groupControl?.updateValueAndValidity();
          groupControl?.disable();
        }
      } else {
        groupControl?.setValue(null);
        groupControl?.updateValueAndValidity();
        groupControl?.enable();
      }
    });
  }

  private async getOptions() {
    const result = await this.httpClient
      .get<IResult<MenuModel[]>>('api/v1/system/menus')
      .toPromise();
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.menuOptions = this.frameworkService.formService.getTreeNodeOptions(result.content, 0);
      logger.info('[menuOptions]', this.menuOptions);
    } else {
      this.frameworkService.messageService.error(result.message || this.messages.GET_MENUS_FAILED);
    }
  }

  private getParams() {
    const params = { ...this.menuForm.value };
    const { parentId } = this.menuForm.value;
    if (this.menu) {
      params.id = this.menu.id;
    }
    params.parentId = parentId ? parentId : 0;
    logger.info('[params]', params);
    return params;
  }

  public ngOnInit() {
    this.searchMenuFormBuilder();
    this.menuFormBuilder();
    this.getOptions();
    this.getMenus();
  }

  public async getMenus() {
    this.menusLoading = true;
    const { group, name } = this.searchMenuForm.value;
    const params = this.frameworkService.httpService.createHttpParams({
      group: group ? `%${group}%` : null,
      name: name ? `%${name}%` : null,
    });
    const result = await this.httpClient
      .get<IResult<MenuModel[]>>('api/v1/system/menus', {
        params,
      })
      .toPromise();
    this.menusLoading = false;
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.menus = this.frameworkService.formService.getTreeNodes(
        result.content,
        'parentId',
        'subMenus',
      );
      logger.info('[menus]', this.menus);
    } else {
      this.frameworkService.messageService.error(result.message || this.messages.GET_MENUS_FAILED);
    }
  }

  public async createMenu() {
    const params = this.getParams();
    const result = await this.httpClient
      .post<IResult<MenuModel>>('/api/v1/system/menus', params)
      .toPromise();
    const succeed = result.code === HTTP_STATUS_CODE_ENUM.CREATED;
    if (succeed) {
      await this.frameworkService.messageService.success(this.messages.CREATE_SUCCEED);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.CREATE_FAILED,
      );
    }
    return succeed;
  }

  public async updateMenu(id: number) {
    const params = this.getParams();
    const result = await this.httpClient
      .put<IResult<MenuModel>>(`/api/v1/system/menus/${id}`, params)
      .toPromise();
    const succeed = result.code === HTTP_STATUS_CODE_ENUM.OK;
    if (succeed) {
      await this.frameworkService.messageService.success(this.messages.UPDATE_SUCCEED);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.UPDATE_FAILED,
      );
    }
    return succeed;
  }

  public async deleteMenu(id: number) {
    this.deletedMenuId = id;
    const result = await this.httpClient
      .delete<IResult<MenuModel>>(`/api/v1/system/menus/${id}`)
      .toPromise();
    const succeed = result.code === HTTP_STATUS_CODE_ENUM.NO_CONTENT;
    if (succeed) {
      await this.frameworkService.messageService.success(this.messages.DELETE_SUCCEED);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.DELETE_FAILED,
      );
    }
    this.deletedMenuId = 0;
    await this.getMenus();
  }

  public reset() {
    this.searchMenuForm.reset();
    this.getMenus();
  }

  public search() {
    this.getMenus();
  }

  public collapse(menu: MenuModel, isCollapse: boolean): void {
    if (!isCollapse && menu) {
      menu.subMenus.forEach((subMenu) => {
        const target = _.find(this.menus, { id: subMenu.id });
        if (target) {
          target.expand = false;
          this.collapse(target, false);
        }
      });
    }
  }

  public openMenuModal(menu?: MenuModel) {
    this.menu = menu;
    let form = {};
    if (menu) {
      form = {
        group: menu.group,
        parentId: _.toString(menu.parentId),
        sort: menu.sort,
        name: menu.name,
        icon: menu.icon,
        path: menu.path,
        visible: menu.visible,
        comment: menu.comment,
      };
      logger.info('menu', menu);
    } else {
      form = {
        visible: true,
      };
    }
    setTimeout(() => {
      this.menuForm.reset(form);
    }, 0);
    this.menuModalVisible = true;
  }

  public closeMenuModal() {
    this.menuModalVisible = false;
    this.menu = undefined;
  }

  public selectIcon(iconName: string) {
    this.menuForm.patchValue({ icon: iconName });
    this.iconNamesModelVisible = false;
  }

  public async saveMenuForm() {
    this.saveMenuLoading = true;
    const succeed = this.menu ? await this.updateMenu(this.menu.id) : await this.createMenu();
    if (succeed) {
      this.saveMenuLoading = false;
      this.menuModalVisible = false;
      this.menu = undefined;
      await this.getMenus();
      this.layoutService.refreshMenus.emit();
    } else {
      this.saveMenuLoading = false;
    }
  }
}
