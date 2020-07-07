export abstract class BaseModel {
  public id: number;

  public createdUserId: string | null;

  public createdDate: Date;

  public modifiedUserId: string | null;

  public modifiedDate: Date;

  public isDeleted: boolean;

  public version: number;
}
