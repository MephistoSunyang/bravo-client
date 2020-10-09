import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import _ from 'lodash';
import { NzSelectOptionInterface } from 'ng-zorro-antd';
import { NzValidators } from '../../../../shared';
import {
  FrameworkService,
  HTTP_STATUS_CODE_ENUM,
  IDataAndCount,
  IResult,
  logger,
} from '../../../framework';
import { RoleModel, UserModel } from '../../models';
import { LayoutService } from '../../services';
import { USERS_MESSAGE } from './users.message';

@Component({
  templateUrl: './users.template.html',
  styleUrls: ['./users.style.less'],
})
export class UsersComponent implements OnInit {
  public messages = USERS_MESSAGE;
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
  public passwordHasPassword: boolean;
  public passwordForm: FormGroup;
  public passwordLoading = false;
  public passwordDisabled = false;
  public get providersForm() {
    return (this.userForm.get('providers') as unknown) as FormArray;
  }

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
      confirmPassword: new FormControl(null),
      nickname: new FormControl(null),
      realname: new FormControl(null),
      phone: new FormControl(null, [NzValidators.phone(this.messages.PHONE_INVALID)]),
      email: new FormControl(null, [NzValidators.email(this.messages.EMAIL_INVALID)]),
      providers: new FormArray([]),
      roleIds: new FormControl(null),
      comment: new FormControl(null),
    });
    this.userForm.statusChanges.subscribe((status) => {
      this.saveUserDisabled = status !== 'VALID';
    });
  }

  private passwordFormBuilder() {
    this.passwordForm = new FormGroup({
      password: new FormControl(null),
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

  private createProviderItemForm() {
    return new FormGroup({
      type: new FormControl(null, [NzValidators.required(this.messages.TYPE_REQUIRED)]),
      key: new FormControl(null, [NzValidators.required(this.messages.KEY_REQUIRED)]),
    });
  }

  private async getOptions() {
    const result = await this.httpClient
      .get<IResult<RoleModel[]>>('api/v1/system/roles')
      .toPromise();
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.roles = result.content;
      this.roleOptions = this.frameworkService.formService.getSelectOptionsByCollections(
        result.content,
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
    logger.info('[params]', params);
    return params;
  }

  private async createUser() {
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

  private async updateUser(id: number) {
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

  private async createUserPassword() {
    this.saveUserLoading = true;
    const { newPassword } = this.passwordForm.value;
    const params = { password: newPassword };
    const result = await this.httpClient
      .post<IResult>(`api/v1/system/users/${this.passwordUserId}/password`, params)
      .toPromise();
    this.saveUserLoading = false;
    const succeed = result.code === HTTP_STATUS_CODE_ENUM.CREATED;
    if (succeed) {
      await this.frameworkService.messageService.success(this.messages.CREATE_PASSWORD_SUCCEED);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.CREATE_PASSWORD_FAILED,
      );
    }
    return succeed;
  }

  private async updateUserPassword() {
    this.saveUserLoading = true;
    const { password, newPassword } = this.passwordForm.value;
    const params = { password, newPassword };
    const result = await this.httpClient
      .patch<IResult>(`api/v1/system/users/${this.passwordUserId}/password`, params)
      .toPromise();
    const succeed = result.code === HTTP_STATUS_CODE_ENUM.OK;
    if (succeed) {
      await this.frameworkService.messageService.success(this.messages.UPDATE_PASSWORD_SUCCEED);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.UPDATE_PASSWORD_FAILED,
      );
    }
    return succeed;
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
    _.each(this.providersForm.controls, () => {
      this.providersForm.at(0).reset({});
      this.providersForm.removeAt(0);
    });
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
    }
    setTimeout(() => {
      this.userForm.reset(form);
      if (user && user.providers && user.providers.length !== 0) {
        _.each(user.providers, ({ type, key }) => {
          this.providersForm.push(this.createProviderItemForm());
          this.providersForm.at(this.providersForm.length - 1).reset({ type, key });
        });
      }
    }, 0);
    this.userModalVisible = true;
  }

  public closeUserModal() {
    this.userModalVisible = false;
    this.user = undefined;
  }

  public addProviderItem() {
    this.providersForm.insert(this.providersForm.length, this.createProviderItemForm());
    this.providersForm.at(this.providersForm.length - 1).reset({});
  }

  public removeProviderItem(index: number) {
    this.providersForm.at(index).reset({});
    this.providersForm.removeAt(index);
  }

  public async saveUserForm() {
    this.saveUserLoading = true;
    const succeed = this.user ? await this.updateUser(this.user.id) : await this.createUser();
    this.saveUserLoading = false;
    if (succeed) {
      this.closeUserModal();
      await this.getUsersAndCount(1);
      this.layoutService.refreshMenus.emit();
    }
  }

  public openPasswordModel(user: UserModel) {
    this.passwordUserId = user.id;
    this.passwordHasPassword = user.hasPassword;
    if (this.passwordHasPassword) {
      this.passwordForm
        .get('password')
        ?.setValidators([NzValidators.required(this.messages.OLD_PASSWORD_REQUIRED)]);
    } else {
      this.passwordForm.get('password')?.clearValidators();
    }
    this.passwordForm.reset({});
    this.passwordModalVisible = true;
  }

  public closePasswordModel() {
    this.passwordModalVisible = false;
    this.passwordHasPassword = false;
    this.passwordUserId = undefined;
  }

  public async savePasswordForm() {
    this.saveUserLoading = true;
    const succeed = this.passwordHasPassword
      ? await this.updateUserPassword()
      : await this.createUserPassword();
    this.saveUserLoading = false;
    if (succeed) {
      this.closePasswordModel();
      await this.getUsersAndCount(1);
    }
  }
}
