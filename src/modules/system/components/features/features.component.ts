import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import _ from 'lodash';
import { NzSelectOptionInterface, NzTreeNodeOptions } from 'ng-zorro-antd';
import { of } from 'rxjs';
import { NzValidators } from '../../../../shared';
import {
  FrameworkService,
  HTTP_STATUS_CODE_ENUM,
  IDataAndCount,
  IResult,
  logger,
} from '../../../framework';
import { ActionModel, FeatureModel, MenuModel, PermissionModel } from '../../models';
import { FEATURES_MESSAGE } from './features.message';

@Component({
  templateUrl: './features.template.html',
})
export class FeaturesComponent implements OnInit {
  public messages = FEATURES_MESSAGE;
  public searchFeatureForm: FormGroup;
  public features: FeatureModel[] = [];
  public featuresTotal = 0;
  public featuresPageNumber = 1;
  public featuresPageSize = 10;
  public featuresLoading = false;
  public deletedFeatureId = 0;
  public featureModalVisible = false;
  public menus: MenuModel[] = [];
  public permissions: PermissionModel[] = [];
  public actions: ActionModel[] = [];
  public menuOptions: NzTreeNodeOptions[] = [];
  public permissionOptions: NzSelectOptionInterface[] = [];
  public actionOptions: NzSelectOptionInterface[] = [];
  public featureForm: FormGroup;
  public feature: FeatureModel | undefined;
  public saveFeatureLoading = false;
  public saveFeatureDisabled = false;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly frameworkService: FrameworkService,
  ) {}

  private searchFeatureFormBuilder() {
    this.searchFeatureForm = new FormGroup({
      code: new FormControl(null),
      name: new FormControl(null),
    });
  }

  private uniqueCodeValidator(code: string) {
    return this.feature && this.feature.code === code
      ? of(null)
      : this.httpClient.get<IResult<FeatureModel[]>>('api/v1/system/features', {
          params: { code },
        });
  }

  private featureFormBuilder() {
    const uniqueValidator = NzValidators.unique(
      this.uniqueCodeValidator.bind(this),
      this.messages.CODE_UNIQUE,
    );
    this.featureForm = new FormGroup({
      code: new FormControl(
        null,
        [NzValidators.required(this.messages.CODE_REQUIRED)],
        [uniqueValidator],
      ),
      name: new FormControl(null, [NzValidators.required(this.messages.NAME_REQUIRED)]),
      menuIds: new FormControl(null),
      permissionIds: new FormControl(null),
      actionIds: new FormControl(null),
      comment: new FormControl(null),
    });
    this.featureForm.statusChanges.subscribe((status) => {
      this.saveFeatureDisabled = status !== 'VALID';
    });
  }

  private async getOptions() {
    const [menusResult, permissionsResult, actionsResult] = await Promise.all([
      this.httpClient.get<IResult<MenuModel[]>>('api/v1/system/menus').toPromise(),
      this.httpClient.get<IResult<PermissionModel[]>>('api/v1/system/permissions').toPromise(),
      this.httpClient.get<IResult<ActionModel[]>>('api/v1/system/actions').toPromise(),
    ]);
    if (
      menusResult.code === HTTP_STATUS_CODE_ENUM.OK &&
      permissionsResult.code === HTTP_STATUS_CODE_ENUM.OK &&
      actionsResult.code === HTTP_STATUS_CODE_ENUM.OK
    ) {
      this.menus = menusResult.content;
      this.permissions = permissionsResult.content;
      this.actions = actionsResult.content;
      this.menuOptions = this.frameworkService.formService.getTreeNodeOptions(
        menusResult.content,
        0,
      );
      this.permissionOptions = this.frameworkService.formService.getSelectOptionsByCollections(
        permissionsResult.content,
      );
      this.actionOptions = this.frameworkService.formService.getSelectOptionsByCollections(
        actionsResult.content,
      );
      logger.info('[menus]', this.menus);
      logger.info('[permissions]', this.permissions);
      logger.info('[actions]', this.actions);
      logger.info('[menuOptions]', this.menuOptions);
      logger.info('[permissionOptions]', this.permissionOptions);
      logger.info('[actionOptions]', this.actionOptions);
    } else {
      this.frameworkService.messageService.error(this.messages.GET_OPTIONS_FAILED);
    }
  }

  private getParams() {
    const params = { ...this.featureForm.value };
    const { menuIds, permissionIds, actionIds } = this.featureForm.value;
    if (this.feature) {
      params.id = this.feature.id;
    }
    if (menuIds && menuIds.length !== 0) {
      params.menus = this.frameworkService.formService.getSelectedCollections(
        menuIds,
        this.menus,
        'parentId',
      );
    }
    if (permissionIds && permissionIds.length !== 0) {
      const permissions = _.chain(permissionIds)
        .map((permissionId) => _.find(this.permissions, { id: _.toNumber(permissionId) }))
        .compact()
        .value();
      params.permissions = permissions;
    }
    if (actionIds && actionIds.length !== 0) {
      const actions = _.chain(actionIds)
        .map((actionId) => _.find(this.actions, { id: _.toNumber(actionId) }))
        .compact()
        .value();
      params.actions = actions;
    }
    logger.info('[params]', params);
    return params;
  }

  public ngOnInit() {
    this.searchFeatureFormBuilder();
    this.featureFormBuilder();
    this.getOptions();
    this.getFeaturesAndCount();
  }

  public async getFeaturesAndCount(
    pageNumber = this.featuresPageNumber,
    pageSize = this.featuresPageSize,
  ) {
    this.featuresLoading = true;
    this.featuresPageNumber = pageNumber;
    this.featuresPageSize = pageSize;
    const { code, name } = this.searchFeatureForm.value;
    const params = this.frameworkService.httpService.createHttpParams({
      code: code ? `%${code}%` : null,
      name: name ? `%${name}%` : null,
      pageNumber: this.featuresPageNumber,
      pageSize: this.featuresPageSize,
    });
    const result = await this.httpClient
      .get<IResult<IDataAndCount<FeatureModel>>>('api/v1/system/features/andCount', {
        params,
      })
      .toPromise();
    this.featuresLoading = false;
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.features = result.content.data;
      this.featuresTotal = result.content.count;
    } else {
      this.frameworkService.messageService.error(
        result.message || this.messages.GET_FEATURES_FAILED,
      );
    }
  }

  public async createFeature() {
    const params = this.getParams();
    const result = await this.httpClient
      .post<IResult<FeatureModel>>('/api/v1/system/features', params)
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

  public async updateFeature(id: number) {
    const params = this.getParams();
    const result = await this.httpClient
      .put<IResult<FeatureModel>>(`/api/v1/system/features/${id}`, params)
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

  public async deleteFeature(id: number) {
    this.deletedFeatureId = id;
    const result = await this.httpClient
      .delete<IResult<FeatureModel>>(`/api/v1/system/features/${id}`)
      .toPromise();
    const succeed = result.code === HTTP_STATUS_CODE_ENUM.NO_CONTENT;
    if (succeed) {
      await this.frameworkService.messageService.success(this.messages.DELETE_SUCCEED);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.DELETE_FAILED,
      );
    }
    this.deletedFeatureId = 0;
    await this.getFeaturesAndCount(1);
  }

  public reset() {
    this.searchFeatureForm.reset();
    this.getFeaturesAndCount(1);
  }

  public search() {
    this.getFeaturesAndCount(1);
  }

  public openFeatureModal(feature?: FeatureModel) {
    this.feature = feature;
    let form = {};
    if (feature) {
      form = {
        code: feature.code,
        name: feature.name,
        comment: feature.comment,
        menuIds: _.map(feature.menus, (menu) => _.toString(menu.id)),
        permissionIds: _.map(feature.permissions, (permission) => _.toString(permission.id)),
        actionIds: _.map(feature.actions, (action) => _.toString(action.id)),
      };
      logger.info('feature', feature);
    }
    setTimeout(() => {
      this.featureForm.reset(form);
    }, 0);
    this.featureModalVisible = true;
  }

  public closeFeatureModal() {
    this.featureModalVisible = false;
    this.feature = undefined;
  }

  public async saveFeatureForm() {
    this.saveFeatureLoading = true;
    const succeed = this.feature
      ? await this.updateFeature(this.feature.id)
      : await this.createFeature();
    if (succeed) {
      this.saveFeatureLoading = false;
      this.featureModalVisible = false;
      this.feature = undefined;
      await this.getFeaturesAndCount(1);
    } else {
      this.saveFeatureLoading = false;
    }
  }
}
