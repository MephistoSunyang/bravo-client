import { BaseModel } from './base.model';
import { FeatureModel } from './feature.model';

export class RoleModel extends BaseModel {
  public roleGroupId: number;

  public code: string;

  public name: string;

  public features?: FeatureModel[];

  public comment: string | null;
}
