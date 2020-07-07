import { ActionModel } from './action.model';
import { BaseModel } from './base.model';
import { MenuModel } from './menu.model';
import { PermissionModel } from './permission.model';

export class FeatureModel extends BaseModel {
  public code: string;

  public name: string;

  public menus?: MenuModel[];

  public permissions?: PermissionModel[];

  public actions?: ActionModel[];

  public comment: string | null;
}
