import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import _ from 'lodash';
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
import { FeatureModel, RoleGroupModel, RoleModel } from '../../models';
import { LayoutService } from '../../services';
import { ROLES_MESSAGE } from './roles.message';

@Component({
  templateUrl: './roles.template.html',
})
export class RolesComponent implements OnInit {
  public messages = ROLES_MESSAGE;
  public searchRoleForm: FormGroup;
  public roles: RoleModel[] = [];
  public rolesTotal = 0;
  public rolesPageNumber = 1;
  public rolesPageSize = 10;
  public rolesLoading = false;
  public deletedRoleId = 0;
  public roleModalVisible = false;
  public features: FeatureModel[] = [];
  public roleGroups: RoleGroupModel[] = [];
  public featureOptions: NzSelectOptionInterface[] = [];
  public roleGroupOptions: NzSelectOptionInterface[] = [];
  public roleForm: FormGroup;
  public role: RoleModel | undefined;
  public saveRoleLoading = false;
  public saveRoleDisabled = false;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly frameworkService: FrameworkService,
    private readonly layoutService: LayoutService,
  ) {}

  private searchRoleFormBuilder() {
    this.searchRoleForm = new FormGroup({
      roleGroupId: new FormControl(null),
      code: new FormControl(null),
      name: new FormControl(null),
    });
  }

  private uniqueCodeValidator(code: string) {
    return this.role && this.role.code === code
      ? of(null)
      : this.httpClient.get<IResult<RoleModel[]>>('api/v1/system/roles', {
          params: { code },
        });
  }

  private roleFormBuilder() {
    const uniqueValidator = NzValidators.unique(
      this.uniqueCodeValidator.bind(this),
      this.messages.CODE_UNIQUE,
    );
    this.roleForm = new FormGroup({
      roleGroupId: new FormControl(null),
      code: new FormControl(
        null,
        [NzValidators.required(this.messages.CODE_REQUIRED)],
        [uniqueValidator],
      ),
      name: new FormControl(null, [NzValidators.required(this.messages.NAME_REQUIRED)]),
      comment: new FormControl(null),
      featureIds: new FormControl(null),
    });
    this.roleForm.statusChanges.subscribe((status) => {
      this.saveRoleDisabled = status !== 'VALID';
    });
  }

  private async getOptions() {
    const [roleGroupsResult, featuresResult] = await Promise.all([
      this.httpClient.get<IResult<RoleGroupModel[]>>('api/v1/system/roleGroups').toPromise(),
      this.httpClient.get<IResult<FeatureModel[]>>('api/v1/system/features').toPromise(),
    ]);
    if (
      roleGroupsResult.code === HTTP_STATUS_CODE_ENUM.OK &&
      featuresResult.code === HTTP_STATUS_CODE_ENUM.OK
    ) {
      this.roleGroups = roleGroupsResult.content;
      this.features = featuresResult.content;
      this.roleGroupOptions = this.frameworkService.formService.getSelectOptionsByCollections(
        roleGroupsResult.content,
      );
      this.featureOptions = this.frameworkService.formService.getSelectOptionsByCollections(
        featuresResult.content,
      );
      logger.info('[roleGroups]', this.roleGroups);
      logger.info('[features]', this.features);
      logger.info('[roleGroupOptions]', this.roleGroupOptions);
      logger.info('[featureOptions]', this.featureOptions);
    } else {
      this.frameworkService.messageService.error(this.messages.GET_OPTIONS_FAILED);
    }
  }

  private getParams() {
    const params = { ...this.roleForm.value };
    const { featureIds } = this.roleForm.value;
    if (this.role) {
      params.id = this.role.id;
    }
    if (featureIds && featureIds.length !== 0) {
      const features = _.chain(featureIds)
        .map((featureId) => _.find(this.features, { id: _.toNumber(featureId) }))
        .compact()
        .value();
      params.features = features;
    }
    logger.info('[params]', params);
    return params;
  }

  public ngOnInit() {
    this.searchRoleFormBuilder();
    this.roleFormBuilder();
    this.getOptions();
    this.getRolesAndCount();
  }

  public async getRolesAndCount(pageNumber = this.rolesPageNumber, pageSize = this.rolesPageSize) {
    this.rolesLoading = true;
    this.rolesPageNumber = pageNumber;
    this.rolesPageSize = pageSize;
    const { roleGroupId, code, name } = this.searchRoleForm.value;
    const params = this.frameworkService.httpService.createHttpParams({
      roleGroupId,
      code: code ? `%${code}%` : null,
      name: name ? `%${name}%` : null,
      pageNumber: this.rolesPageNumber,
      pageSize: this.rolesPageSize,
    });
    const result = await this.httpClient
      .get<IResult<IDataAndCount<RoleModel>>>('api/v1/system/roles/andCount', {
        params,
      })
      .toPromise();
    this.rolesLoading = false;
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.roles = result.content.data;
      this.rolesTotal = result.content.count;
    } else {
      this.frameworkService.messageService.error(result.message || this.messages.GET_ROLES_FAILED);
    }
  }

  public async createRole() {
    const params = this.getParams();
    const result = await this.httpClient
      .post<IResult<RoleModel>>('/api/v1/system/roles', params)
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

  public async updateRole(id: number) {
    const params = this.getParams();
    const result = await this.httpClient
      .put<IResult<RoleModel>>(`/api/v1/system/roles/${id}`, params)
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

  public async deleteRole(id: number) {
    this.deletedRoleId = id;
    const result = await this.httpClient
      .delete<IResult<RoleModel>>(`/api/v1/system/roles/${id}`)
      .toPromise();
    const succeed = result.code === HTTP_STATUS_CODE_ENUM.NO_CONTENT;
    if (succeed) {
      await this.frameworkService.messageService.success(this.messages.DELETE_SUCCEED);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.DELETE_FAILED,
      );
    }
    this.deletedRoleId = 0;
    await this.getRolesAndCount(1);
  }

  public reset() {
    this.searchRoleForm.reset();
    this.getRolesAndCount(1);
  }

  public search() {
    this.getRolesAndCount(1);
  }

  public openRoleModal(role?: RoleModel) {
    this.role = role;
    let form = {};
    if (role) {
      form = {
        roleGroupId: role.roleGroupId,
        code: role.code,
        name: role.name,
        comment: role.comment,
        featureIds: _.map(role.features, (feature) => _.toString(feature.id)),
      };
      logger.info('role', role);
    }
    setTimeout(() => {
      this.roleForm.reset(form);
    }, 0);
    this.roleModalVisible = true;
  }

  public closeRoleModal() {
    this.roleModalVisible = false;
    this.role = undefined;
  }

  public async saveRoleForm() {
    this.saveRoleLoading = true;
    const succeed = this.role ? await this.updateRole(this.role.id) : await this.createRole();
    if (succeed) {
      this.saveRoleLoading = false;
      this.roleModalVisible = false;
      this.role = undefined;
      await this.getRolesAndCount(1);
      this.layoutService.refreshMenus.emit();
    } else {
      this.saveRoleLoading = false;
    }
  }
}
