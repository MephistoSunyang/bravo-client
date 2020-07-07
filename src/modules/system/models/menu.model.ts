import { BaseModel } from './base.model';

export class MenuModel extends BaseModel {
  public group: string;

  public parentId: number;

  public parent?: MenuModel;

  public sort: number;

  public name: string;

  public icon: string | null;

  public path: string | null;

  public visible: boolean;

  public comment: string | null;

  public subMenus: MenuModel[];
}
