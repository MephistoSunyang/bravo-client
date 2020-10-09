import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NzSelectOptionInterface } from 'ng-zorro-antd';
import { of } from 'rxjs';
import { NzValidators } from '../../../../shared';
import {
  FrameworkService,
  HTTP_STATUS_CODE_ENUM,
  IDataAndCount,
  IResult,
  logger,
} from '../../../framework';
import { ACTION_METHOD_ENUM } from '../../enums';
import { ActionModel } from '../../models';
import { ACTIONS_MESSAGE } from './actions.message';

@Component({
  templateUrl: './actions.template.html',
})
export class ActionsComponent implements OnInit {
  public messages = ACTIONS_MESSAGE;
  public methodOptions: NzSelectOptionInterface[] = [];
  public searchActionForm: FormGroup;
  public actions: ActionModel[] = [];
  public actionsTotal = 0;
  public actionsPageNumber = 1;
  public actionsPageSize = 10;
  public actionsLoading = false;
  public deletedActionId = 0;
  public actionModalVisible = false;
  public actionForm: FormGroup;
  public action: ActionModel | undefined;
  public saveActionLoading = false;
  public saveActionDisabled = false;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly frameworkService: FrameworkService,
  ) {}

  private searchActionFormBuilder() {
    this.searchActionForm = new FormGroup({
      code: new FormControl(null),
      name: new FormControl(null),
      method: new FormControl(null),
      path: new FormControl(null),
    });
  }

  private uniqueCodeValidator(code: string) {
    return this.action && this.action.code === code
      ? of(null)
      : this.httpClient.get<IResult<ActionModel[]>>('api/v1/system/actions', {
          params: { code },
        });
  }

  private actionFormBuilder() {
    const uniqueValidator = NzValidators.unique(
      this.uniqueCodeValidator.bind(this),
      this.messages.CODE_UNIQUE,
    );
    this.actionForm = new FormGroup({
      code: new FormControl(null, [], [uniqueValidator]),
      name: new FormControl(null, [NzValidators.required(this.messages.NAME_REQUIRED)]),
      method: new FormControl(null, [NzValidators.required(this.messages.METHOD_REQUIRED)]),
      path: new FormControl(null, [NzValidators.required(this.messages.PATH_REQUIRED)]),
      comment: new FormControl(null),
    });
    this.actionForm.statusChanges.subscribe((status) => {
      this.saveActionDisabled = status !== 'VALID';
    });
  }

  private getOptions() {
    this.methodOptions = this.frameworkService.formService.getSelectOptionsByEnums(
      ACTION_METHOD_ENUM,
    );
    logger.info('[methodOptions]', this.methodOptions);
  }

  private getParams() {
    const params = { ...this.actionForm.value };
    if (this.action) {
      params.id = this.action.id;
    }
    logger.info('[params]', params);
    return params;
  }

  public ngOnInit() {
    this.searchActionFormBuilder();
    this.actionFormBuilder();
    this.getOptions();
    this.getActionsAndCount();
  }

  public async getActionsAndCount(
    pageNumber = this.actionsPageNumber,
    pageSize = this.actionsPageSize,
  ) {
    this.actionsLoading = true;
    this.actionsPageNumber = pageNumber;
    this.actionsPageSize = pageSize;
    const { code, name, method, path } = this.searchActionForm.value;
    const params = this.frameworkService.httpService.createHttpParams({
      code: code ? `%${code}%` : null,
      name: name ? `%${name}%` : null,
      method,
      path: path ? `%${path}%` : null,
      pageNumber: this.actionsPageNumber,
      pageSize: this.actionsPageSize,
    });
    const result = await this.httpClient
      .get<IResult<IDataAndCount<ActionModel>>>('api/v1/system/actions/andCount', {
        params,
      })
      .toPromise();
    this.actionsLoading = false;
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.actions = result.content.data;
      this.actionsTotal = result.content.count;
    } else {
      this.frameworkService.messageService.error(
        result.message || this.messages.GET_ACTIONS_FAILED,
      );
    }
  }

  public async createAction() {
    const params = this.getParams();
    const result = await this.httpClient
      .post<IResult<ActionModel>>('/api/v1/system/actions', params)
      .toPromise();
    const succeed = result.code === HTTP_STATUS_CODE_ENUM.CREATED;
    if (succeed) {
      await this.frameworkService.messageService.success(this.messages.CREATE_SUCCEED);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.CREATE_FAILED,
      );
    }
    return succeed;
  }

  public async updateAction(id: number) {
    const params = this.getParams();
    const result = await this.httpClient
      .put<IResult<ActionModel>>(`/api/v1/system/actions/${id}`, params)
      .toPromise();
    const succeed = result.code === HTTP_STATUS_CODE_ENUM.OK;
    if (succeed) {
      await this.frameworkService.messageService.success(this.messages.UPDATE_SUCCEED);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.UPDATE_FAILED,
      );
    }
    return succeed;
  }

  public async deleteAction(id: number) {
    this.deletedActionId = id;
    const result = await this.httpClient
      .delete<IResult<ActionModel>>(`/api/v1/system/actions/${id}`)
      .toPromise();
    const succeed = result.code === HTTP_STATUS_CODE_ENUM.NO_CONTENT;
    if (succeed) {
      await this.frameworkService.messageService.success(this.messages.DELETE_SUCCEED);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.DELETE_FAILED,
      );
    }
    this.deletedActionId = 0;
    await this.getActionsAndCount(1);
  }

  public reset() {
    this.searchActionForm.reset();
    this.getActionsAndCount(1);
  }

  public search() {
    this.getActionsAndCount(1);
  }

  public openActionModal(action?: ActionModel) {
    this.action = action;
    let form = {};
    if (action) {
      form = {
        code: action.code,
        name: action.name,
        method: action.method,
        path: action.path,
        comment: action.comment,
      };
      logger.info('action', action);
    }
    setTimeout(() => {
      this.actionForm.reset(form);
    }, 0);
    this.actionModalVisible = true;
  }

  public closeActionModal() {
    this.actionModalVisible = false;
    this.action = undefined;
  }

  public async saveActionForm() {
    this.saveActionLoading = true;
    const succeed = this.action
      ? await this.updateAction(this.action.id)
      : await this.createAction();
    if (succeed) {
      this.saveActionLoading = false;
      this.actionModalVisible = false;
      this.action = undefined;
      await this.getActionsAndCount(1);
    } else {
      this.saveActionLoading = false;
    }
  }
}
