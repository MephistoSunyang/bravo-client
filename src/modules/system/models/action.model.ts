import { ACTION_METHOD_ENUM } from '../enums';
import { BaseModel } from './base.model';

export class ActionModel extends BaseModel {
  public code: string | null;

  public name: string;

  public method: ACTION_METHOD_ENUM;

  public path: string;

  public comment: string | null;
}
