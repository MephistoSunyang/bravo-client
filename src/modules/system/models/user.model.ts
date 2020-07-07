import { BaseModel } from './base.model';
import { RoleModel } from './role.model';

export class UserModel extends BaseModel {
  public username: string;

  public nickname: string | null;

  public realname: string | null;

  public phone: string | null;

  public email: string | null;

  public roles?: RoleModel[];

  public comment: string | null;
}
