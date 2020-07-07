import { NzTreeNodeOptions } from 'ng-zorro-antd';

export interface ITreeNodeOptions<IModel> {
  keyField?: keyof IModel;
  titleField?: keyof IModel;
  parentIdField?: keyof IModel;
  firstOption?: NzTreeNodeOptions | null;
}
