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
import { PermissionModel } from '../../models';
import { PERMISSIONS_MESSAGE } from './permissions.message';

@Component({
  templateUrl: './permissions.template.html',
})
export class PermissionsComponent implements OnInit {
  public messages = PERMISSIONS_MESSAGE;
  public searchPermissionForm: FormGroup;
  public permissions: PermissionModel[] = [];
  public permissionsTotal = 0;
  public permissionsPageNumber = 1;
  public permissionsPageSize = 10;
  public permissionsLoading = false;
  public deletedPermissionId = 0;
  public permissionModalVisible = false;
  public permissionForm: FormGroup;
  public permission: PermissionModel | undefined;
  public savePermissionLoading = false;
  public savePermissionDisabled = false;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly frameworkService: FrameworkService,
  ) {}

  private searchPermissionFormBuilder() {
    this.searchPermissionForm = new FormGroup({
      code: new FormControl(null),
      name: new FormControl(null),
    });
  }

  private uniqueCodeValidator(code: string) {
    return this.permission && this.permission.code === code
      ? of(null)
      : this.httpClient.get<IResult<PermissionModel[]>>('api/v1/system/permissions', {
          params: { code },
        });
  }

  private permissionFormBuilder() {
    const uniqueValidator = NzValidators.unique(
      this.uniqueCodeValidator.bind(this),
      this.messages.CODE_UNIQUE,
    );
    this.permissionForm = new FormGroup({
      code: new FormControl(
        null,
        [NzValidators.required(this.messages.CODE_REQUIRED)],
        [uniqueValidator],
      ),
      name: new FormControl(null, [NzValidators.required(this.messages.NAME_REQUIRED)]),
      comment: new FormControl(null),
    });
    this.permissionForm.statusChanges.subscribe((status) => {
      this.savePermissionDisabled = status !== 'VALID';
    });
  }

  private getParams() {
    const params = { ...this.permissionForm.value };
    if (this.permission) {
      params.id = this.permission.id;
    }
    logger.info('[params]', params);
    return params;
  }

  public ngOnInit() {
    this.searchPermissionFormBuilder();
    this.permissionFormBuilder();
    this.getPermissionsAndCount();
  }

  public async getPermissionsAndCount(
    pageNumber = this.permissionsPageNumber,
    pageSize = this.permissionsPageSize,
  ) {
    this.permissionsLoading = true;
    this.permissionsPageNumber = pageNumber;
    this.permissionsPageSize = pageSize;
    const { code, name } = this.searchPermissionForm.value;
    const params = this.frameworkService.httpService.createHttpParams({
      code: code ? `%${code}%` : null,
      name: name ? `%${name}%` : null,
      pageNumber: this.permissionsPageNumber,
      pageSize: this.permissionsPageSize,
    });
    const result = await this.httpClient
      .get<IResult<IDataAndCount<PermissionModel>>>('api/v1/system/permissions/andCount', {
        params,
      })
      .toPromise();
    this.permissionsLoading = false;
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.permissions = result.content.data;
      this.permissionsTotal = result.content.count;
    } else {
      this.frameworkService.messageService.error(
        result.message || this.messages.GET_PERMISSIONS_FAILED,
      );
    }
  }

  public async createPermission() {
    const params = this.getParams();
    const result = await this.httpClient
      .post<IResult<PermissionModel>>('/api/v1/system/permissions', params)
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

  public async updatePermission(id: number) {
    const params = this.getParams();
    const result = await this.httpClient
      .put<IResult<PermissionModel>>(`/api/v1/system/permissions/${id}`, params)
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

  public async deletePermission(id: number) {
    this.deletedPermissionId = id;
    const result = await this.httpClient
      .delete<IResult<PermissionModel>>(`/api/v1/system/permissions/${id}`)
      .toPromise();
    const succeed = result.code === HTTP_STATUS_CODE_ENUM.NO_CONTENT;
    if (succeed) {
      await this.frameworkService.messageService.success(this.messages.DELETE_SUCCEED);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.DELETE_FAILED,
      );
    }
    this.deletedPermissionId = 0;
    await this.getPermissionsAndCount(1);
  }

  public reset() {
    this.searchPermissionForm.reset();
    this.getPermissionsAndCount(1);
  }

  public search() {
    this.getPermissionsAndCount(1);
  }

  public openPermissionModal(permission?: PermissionModel) {
    this.permission = permission;
    let form = {};
    if (permission) {
      form = {
        code: permission.code,
        name: permission.name,
        comment: permission.comment,
      };
      logger.info('permission', permission);
    }
    setTimeout(() => {
      this.permissionForm.reset(form);
    }, 0);
    this.permissionModalVisible = true;
  }

  public closePermissionModal() {
    this.permissionModalVisible = false;
    this.permission = undefined;
  }

  public async savePermissionForm() {
    this.savePermissionLoading = true;
    const succeed = this.permission
      ? await this.updatePermission(this.permission.id)
      : await this.createPermission();
    if (succeed) {
      this.savePermissionLoading = false;
      this.permissionModalVisible = false;
      this.permission = undefined;
      await this.getPermissionsAndCount(1);
    } else {
      this.savePermissionLoading = false;
    }
  }
}
