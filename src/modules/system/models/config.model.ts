import { BaseModel } from './base.model';

export class ConfigModel extends BaseModel {
  public code: string;

  public name: string;

  public contentEncrypted: boolean;

  public content: string;

  public comment: string | null;
}
