export interface IResult<IContent = any> {
  content: IContent;
  code?: number;
  message?: string;
}
