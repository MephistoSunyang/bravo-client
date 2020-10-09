import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import _ from 'lodash';
import { MenuModel } from '../../models';

@Component({
  selector: 'system-menus',
  templateUrl: './system-menus.template.html',
})
export class SystemMenusComponent {
  @Input()
  public model: 'vertical' | 'horizontal' | 'inline' = 'vertical';
  @Input()
  public theme: 'light' | 'dark' = 'light';
  @Input()
  public menus: MenuModel[];
  @Input()
  public firstMenu: MenuModel | undefined;

  constructor(private readonly router: Router) {}

  public checkParentMenuOpen(parentMenu: MenuModel) {
    return _.some(
      parentMenu.subMenus,
      (subMenu) => subMenu.path && this.router.isActive(subMenu.path, true),
    );
  }
}
