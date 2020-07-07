import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { NzValidators } from '../../../../shared';
import {
  FrameworkService,
  HTTP_STATUS_CODE_ENUM,
  IDataAndCount,
  IResult,
  logger,
} from '../../../framework';
import { RoleGroupModel } from '../../models';
import { ROLE_GROUPS_MESSAGE } from './role-groups.message';

@Component({
  templateUrl: './role-groups.template.html',
})
export class RoleGroupsComponent implements OnInit {
  public messages = ROLE_GROUPS_MESSAGE;
  public searchRoleGroupForm: FormGroup;
  public roleGroups: RoleGroupModel[] = [];
  public roleGroupsTotal = 0;
  public roleGroupsPageNumber = 1;
  public roleGroupsPageSize = 10;
  public roleGroupsLoading = false;
  public deletedRoleGroupId = 0;
  public roleGroupModalVisible = false;
  public roleGroupForm: FormGroup;
  public roleGroup: RoleGroupModel | undefined;
  public saveRoleGroupLoading = false;
  public saveRoleGroupDisabled = false;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly frameworkService: FrameworkService,
  ) {}

  private searchRoleGroupFormBuilder() {
    this.searchRoleGroupForm = new FormGroup({
      code: new FormControl(null),
      name: new FormControl(null),
    });
  }

  private uniqueCodeValidator(code: string) {
    return this.roleGroup && this.roleGroup.code === code
      ? of(null)
      : this.httpClient.get<IResult<RoleGroupModel[]>>('api/v1/system/roleGroups', {
          params: { code },
        });
  }

  private roleGroupFormBuilder() {
    const uniqueValidator = NzValidators.unique(
      this.uniqueCodeValidator.bind(this),
      this.messages.CODE_UNIQUE,
    );
    this.roleGroupForm = new FormGroup({
      code: new FormControl(
        null,
        [NzValidators.required(this.messages.CODE_REQUIRED)],
        [uniqueValidator],
      ),
      name: new FormControl(null, [NzValidators.required(this.messages.NAME_REQUIRED)]),
      comment: new FormControl(null),
    });
    this.roleGroupForm.statusChanges.subscribe((status) => {
      this.saveRoleGroupDisabled = status !== 'VALID';
    });
  }

  private getParams() {
    const params = { ...this.roleGroupForm.value };
    if (this.roleGroup) {
      params.id = this.roleGroup.id;
    }
    logger.info('[params]', params);
    return params;
  }

  public ngOnInit() {
    this.searchRoleGroupFormBuilder();
    this.roleGroupFormBuilder();
    this.getRoleGroupsAndCount();
  }

  public async getRoleGroupsAndCount(
    pageNumber = this.roleGroupsPageNumber,
    pageSize = this.roleGroupsPageSize,
  ) {
    this.roleGroupsLoading = true;
    this.roleGroupsPageNumber = pageNumber;
    this.roleGroupsPageSize = pageSize;
    const { code, name } = this.searchRoleGroupForm.value;
    const params = this.frameworkService.httpService.createHttpParams({
      code: code ? `%${code}%` : null,
      name: name ? `%${name}%` : null,
      pageNumber: this.roleGroupsPageNumber,
      pageSize: this.roleGroupsPageSize,
    });
    const result = await this.httpClient
      .get<IResult<IDataAndCount<RoleGroupModel>>>('api/v1/system/roleGroups/andCount', {
        params,
      })
      .toPromise();
    this.roleGroupsLoading = false;
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.roleGroups = result.content.data;
      this.roleGroupsTotal = result.content.count;
    } else {
      this.frameworkService.messageService.error(
        result.message || this.messages.GET_ROLE_GROUPS_FAILED,
      );
    }
  }

  public async createRoleGroup() {
    const params = this.getParams();
    const result = await this.httpClient
      .post<IResult<RoleGroupModel>>('/api/v1/system/roleGroups', params)
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

  public async updateRoleGroup(id: number) {
    const params = this.getParams();
    const result = await this.httpClient
      .put<IResult<RoleGroupModel>>(`/api/v1/system/roleGroups/${id}`, params)
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

  public async deleteRoleGroup(id: number) {
    this.deletedRoleGroupId = id;
    const result = await this.httpClient
      .delete<IResult<RoleGroupModel>>(`/api/v1/system/roleGroups/${id}`)
      .toPromise();
    const succeed = result.code === HTTP_STATUS_CODE_ENUM.NO_CONTENT;
    if (succeed) {
      await this.frameworkService.messageService.success(this.messages.DELETE_SUCCEED);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.DELETE_FAILED,
      );
    }
    this.deletedRoleGroupId = 0;
    await this.getRoleGroupsAndCount(1);
  }

  public reset() {
    this.searchRoleGroupForm.reset();
    this.getRoleGroupsAndCount(1);
  }

  public search() {
    this.getRoleGroupsAndCount(1);
  }

  public openRoleGroupModal(roleGroup?: RoleGroupModel) {
    this.roleGroup = roleGroup;
    let form = {};
    if (roleGroup) {
      form = {
        code: roleGroup.code,
        name: roleGroup.name,
        comment: roleGroup.comment,
      };
      logger.info('roleGroup', roleGroup);
    }
    setTimeout(() => {
      this.roleGroupForm.reset(form);
    }, 0);
    this.roleGroupModalVisible = true;
  }

  public closeRoleGroupModal() {
    this.roleGroupModalVisible = false;
    this.roleGroup = undefined;
  }

  public async saveRoleGroupForm() {
    this.saveRoleGroupLoading = true;
    const succeed = this.roleGroup
      ? await this.updateRoleGroup(this.roleGroup.id)
      : await this.createRoleGroup();
    if (succeed) {
      this.saveRoleGroupLoading = false;
      this.roleGroupModalVisible = false;
      this.roleGroup = undefined;
      await this.getRoleGroupsAndCount(1);
    } else {
      this.saveRoleGroupLoading = false;
    }
  }
}
