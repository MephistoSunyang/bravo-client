import { BaseModel } from './base.model';
import { RoleModel } from './role.model';
import { UserProviderModel } from './user-provider.model';

export class UserModel extends BaseModel {
  public username: string;

  public nickname: string | null;

  public realname: string | null;

  public phone: string | null;

  public phoneConfirmed: boolean;

  public email: string | null;

  public emailConfirmed: boolean;

  public hasPassword: boolean;

  public comment: string | null;

  public providers?: UserProviderModel[];

  public roles?: RoleModel[];
}
