import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import _ from 'lodash';
import { NzSelectOptionInterface } from 'ng-zorro-antd';
import { NzValidators } from '../../../../shared';
import {
  FrameworkService,
  HTTP_STATUS_CODE_ENUM,
  IDataAndCount,
  IResult,
  ISelectOption,
  logger,
} from '../../../framework';
import { RoleModel, UserModel } from '../../models';
import { LayoutService } from '../../services';
import { USERS_MESSAGE } from './users.message';

@Component({
  templateUrl: './users.template.html',
})
export class UsersComponent implements OnInit {
  public messages = USERS_MESSAGE;
  public types: ISelectOption[] = [];
  public typeOptions: NzSelectOptionInterface[] = [];
  public roles: RoleModel[] = [];
  public roleOptions: NzSelectOptionInterface[] = [];
  public searchUserForm: FormGroup;
  public users: UserModel[] = [];
  public usersTotal = 0;
  public usersPageNumber = 1;
  public usersPageSize = 10;
  public usersLoading = false;
  public deletedUserId = 0;
  public userModalVisible = false;
  public userForm: FormGroup;
  public user: UserModel | undefined;
  public saveUserLoading = false;
  public saveUserDisabled = false;
  public passwordModalVisible = false;
  public passwordUserId: number | undefined;
  public passwordForm: FormGroup;
  public passwordLoading = false;
  public passwordDisabled = false;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly frameworkService: FrameworkService,
    private readonly layoutService: LayoutService,
  ) {}

  private searchUserFormBuilder() {
    this.searchUserForm = new FormGroup({
      username: new FormControl(null),
      nickname: new FormControl(null),
      realname: new FormControl(null),
      phone: new FormControl(null),
      email: new FormControl(null),
      type: new FormControl(null),
      roleId: new FormControl(null),
    });
  }

  private userFormBuilder() {
    this.userForm = new FormGroup({
      username: new FormControl(null, [NzValidators.required(this.messages.USERNAME_REQUIRED)]),
      password: new FormControl(null),
      confirmPassword: new FormControl(null),
      nickname: new FormControl(null),
      realname: new FormControl(null),
      phone: new FormControl(null, [NzValidators.phone(this.messages.PHONE_INVALID)]),
      email: new FormControl(null, [NzValidators.email(this.messages.EMAIL_INVALID)]),
      roleIds: new FormControl(null),
      comment: new FormControl(null),
    });
    this.userForm.statusChanges.subscribe((status) => {
      this.saveUserDisabled = status !== 'VALID';
    });
  }

  private passwordFormBuilder() {
    this.passwordForm = new FormGroup({
      password: new FormControl(null, [NzValidators.required(this.messages.OLD_PASSWORD_REQUIRED)]),
      newPassword: new FormControl(null, [
        NzValidators.required(this.messages.NEW_PASSWORD_REQUIRED),
      ]),
      confirmNewPassword: new FormControl(null, [
        NzValidators.required(this.messages.NEW_CONFIRM_PASSWORD_REQUIRED),
        NzValidators.different('newPassword', this.messages.PASSWORD_DIFFERENT),
      ]),
    });
    this.passwordForm.statusChanges.subscribe((status) => {
      this.passwordDisabled = status !== 'VALID';
    });
  }

  private async getOptions() {
    const [rolesResult, typesResult] = await Promise.all([
      this.httpClient.get<IResult<RoleModel[]>>('api/v1/system/roles').toPromise(),
      this.httpClient.get<IResult<ISelectOption[]>>('api/v1/system/users/types').toPromise(),
    ]);
    if (
      rolesResult.code === HTTP_STATUS_CODE_ENUM.OK &&
      typesResult.code === HTTP_STATUS_CODE_ENUM.OK
    ) {
      this.roles = rolesResult.content;
      this.types = typesResult.content;
      this.roleOptions = this.frameworkService.formService.getSelectOptionsByCollections(
        rolesResult.content,
      );
      this.typeOptions = this.frameworkService.formService.getSelectOptionsByCollections(
        typesResult.content,
        'value',
        'name',
      );
      logger.info('[roles]', this.roles);
      logger.info('[roleOptions]', this.roleOptions);
    } else {
      this.frameworkService.messageService.error(this.messages.GET_OPTIONS_FAILED);
    }
  }

  private getParams() {
    const params = { ...this.userForm.value };
    const { roleIds } = this.userForm.value;
    if (this.user) {
      params.id = this.user.id;
    }
    if (roleIds && roleIds.length !== 0) {
      const roles = _.chain(roleIds)
        .map((roleId) => _.find(this.roles, { id: _.toNumber(roleId) }))
        .compact()
        .value();
      params.roles = roles;
    }
    params.phoneConfirmed = false;
    params.emailConfirmed = false;
    logger.info('[params]', params);
    return params;
  }

  public ngOnInit() {
    this.searchUserFormBuilder();
    this.userFormBuilder();
    this.passwordFormBuilder();
    this.getOptions();
    this.getUsersAndCount();
  }

  public async getUsersAndCount(pageNumber = this.usersPageNumber, pageSize = this.usersPageSize) {
    this.usersLoading = true;
    this.usersPageNumber = pageNumber;
    this.usersPageSize = pageSize;
    const { username, nickname, realname, phone, email, type, roleId } = this.searchUserForm.value;
    const params = this.frameworkService.httpService.createHttpParams({
      username: username ? `%${username}%` : null,
      nickname: nickname ? `%${nickname}%` : null,
      realname: realname ? `%${realname}%` : null,
      phone: phone ? `%${phone}%` : null,
      email: email ? `%${email}%` : null,
      type,
      roleId,
      pageNumber: this.usersPageNumber,
      pageSize: this.usersPageSize,
    });
    const result = await this.httpClient
      .get<IResult<IDataAndCount<UserModel>>>('api/v1/system/users/andCount', {
        params,
      })
      .toPromise();
    this.usersLoading = false;
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.users = result.content.data;
      this.usersTotal = result.content.count;
    } else {
      this.frameworkService.messageService.error(result.message || this.messages.GET_USERS_FAILED);
    }
  }

  public async createUser() {
    const params = this.getParams();
    const result = await this.httpClient
      .post<IResult<UserModel>>('/api/v1/system/users', params)
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

  public async updateUser(id: number) {
    const params = this.getParams();
    const result = await this.httpClient
      .put<IResult<UserModel>>(`/api/v1/system/users/${id}`, params)
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

  public async deleteUser(id: number) {
    this.deletedUserId = id;
    const result = await this.httpClient
      .delete<IResult<UserModel>>(`/api/v1/system/users/${id}`)
      .toPromise();
    const succeed = result.code === HTTP_STATUS_CODE_ENUM.NO_CONTENT;
    if (succeed) {
      await this.frameworkService.messageService.success(this.messages.DELETE_SUCCEED);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.DELETE_FAILED,
      );
    }
    this.deletedUserId = 0;
    await this.getUsersAndCount(1);
  }

  public reset() {
    this.searchUserForm.reset();
    this.getUsersAndCount(1);
  }

  public search() {
    this.getUsersAndCount(1);
  }

  public openUserModal(user?: UserModel) {
    this.user = user;
    let form = {};
    const passwordControl = this.userForm.get('password');
    const confirmPasswordControl = this.userForm.get('confirmPassword');
    if (user) {
      form = {
        username: user.username,
        nickname: user.nickname,
        realname: user.realname,
        phone: user.phone,
        email: user.email,
        roleIds: _.map(user.roles, (role) => _.toString(role.id)),
        comment: user.comment,
      };
      if (passwordControl && confirmPasswordControl) {
        passwordControl.clearValidators();
        confirmPasswordControl.clearValidators();
      }
      logger.info('user', user);
    } else {
      if (passwordControl && confirmPasswordControl) {
        passwordControl.setValidators([NzValidators.required(this.messages.PASSWORD_REQUIRED)]);
        confirmPasswordControl.setValidators([
          NzValidators.required(this.messages.CONFIRM_PASSWORD_REQUIRED),
          NzValidators.different('password', this.messages.PASSWORD_DIFFERENT),
        ]);
      }
    }
    setTimeout(() => {
      this.userForm.reset(form);
    }, 0);
    this.userModalVisible = true;
  }

  public closeUserModal() {
    this.userModalVisible = false;
    this.user = undefined;
  }

  public async saveUserForm() {
    this.saveUserLoading = true;
    const succeed = this.user ? await this.updateUser(this.user.id) : await this.createUser();
    if (succeed) {
      this.saveUserLoading = false;
      this.closeUserModal();
      await this.getUsersAndCount(1);
      this.layoutService.refreshMenus.emit();
    } else {
      this.saveUserLoading = false;
    }
  }

  public openPasswordModel(userId: number) {
    this.passwordUserId = userId;
    this.passwordForm.reset({});
    this.passwordModalVisible = true;
  }

  public closePasswordModel() {
    this.passwordModalVisible = false;
    this.passwordUserId = undefined;
  }

  public async savePasswordForm() {
    this.saveUserLoading = true;
    const { password, newPassword } = this.passwordForm.value;
    const params = { password, newPassword };
    const result = await this.httpClient
      .patch<IResult>(`api/v1/system/users/${this.passwordUserId}/password`, params)
      .toPromise();
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      await this.frameworkService.messageService.success(this.messages.CHANGE_PASSWORD_SUCCEED);
      this.closePasswordModel();
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.CHANGE_PASSWORD_FAILED,
      );
    }
    this.saveUserLoading = false;
  }
}
