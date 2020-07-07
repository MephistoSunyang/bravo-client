import { BaseModel } from './base.model';

export class PermissionModel extends BaseModel {
  public code: string;

  public name: string;

  public comment: string | null;
}
