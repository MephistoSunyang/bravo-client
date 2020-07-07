import { BaseModel } from './base.model';

export class RoleGroupModel extends BaseModel {
  public code: string;

  public name: string;

  public comment: string | null;
}
