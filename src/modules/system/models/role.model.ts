import { ActionModel } from './action.model';
import { BaseModel } from './base.model';
import { MenuModel } from './menu.model';
import { PermissionModel } from './permission.model';

export class RoleModel extends BaseModel {
  public roleGroupId: number;

  public code: string;

  public name: string;

  public comment: string | null;

  public menus?: MenuModel[];

  public permissions?: PermissionModel[];

  public actions?: ActionModel[];
}
