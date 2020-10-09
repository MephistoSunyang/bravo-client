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
import { ConfigModel } from '../../models';
import { CONFIGS_MESSAGE } from './configs.message';

@Component({
  templateUrl: './configs.template.html',
})
export class ConfigsComponent implements OnInit {
  public messages = CONFIGS_MESSAGE;
  public searchConfigForm: FormGroup;
  public configs: ConfigModel[] = [];
  public configsTotal = 0;
  public configsPageNumber = 1;
  public configsPageSize = 10;
  public configsLoading = false;
  public deletedConfigId = 0;
  public configModalVisible = false;
  public configForm: FormGroup;
  public config: ConfigModel | undefined;
  public saveConfigLoading = false;
  public saveConfigDisabled = false;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly frameworkService: FrameworkService,
  ) {}

  private searchConfigFormBuilder() {
    this.searchConfigForm = new FormGroup({
      code: new FormControl(null),
      name: new FormControl(null),
    });
  }

  private uniqueCodeValidator(code: string) {
    return this.config && this.config.code === code
      ? of(null)
      : this.httpClient.get<IResult<ConfigModel[]>>('api/v1/system/configs', {
          params: { code },
        });
  }

  private configFormBuilder() {
    const uniqueValidator = NzValidators.unique(
      this.uniqueCodeValidator.bind(this),
      this.messages.CODE_UNIQUE,
    );
    this.configForm = new FormGroup({
      code: new FormControl(
        null,
        [NzValidators.required(this.messages.CODE_REQUIRED)],
        [uniqueValidator],
      ),
      name: new FormControl(null, [NzValidators.required(this.messages.NAME_REQUIRED)]),
      contentEncrypted: new FormControl(null),
      content: new FormControl(null, [NzValidators.required(this.messages.CONTENT_REQUIRED)]),
      comment: new FormControl(null),
    });
    this.configForm.statusChanges.subscribe((status) => {
      this.saveConfigDisabled = status !== 'VALID';
    });
  }

  private getParams() {
    const params = { ...this.configForm.value };
    if (this.config) {
      params.id = this.config.id;
    }
    logger.info('[params]', params);
    return params;
  }

  public ngOnInit() {
    this.searchConfigFormBuilder();
    this.configFormBuilder();
    this.getConfigsAndCount();
  }

  public async getConfigsAndCount(
    pageNumber = this.configsPageNumber,
    pageSize = this.configsPageSize,
  ) {
    this.configsLoading = true;
    this.configsPageNumber = pageNumber;
    this.configsPageSize = pageSize;
    const { code, name } = this.searchConfigForm.value;
    const params = this.frameworkService.httpService.createHttpParams({
      code: code ? `%${code}%` : null,
      name: name ? `%${name}%` : null,
      pageNumber: this.configsPageNumber,
      pageSize: this.configsPageSize,
    });
    const result = await this.httpClient
      .get<IResult<IDataAndCount<ConfigModel>>>('api/v1/system/configs/andCount', {
        params,
      })
      .toPromise();
    this.configsLoading = false;
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.configs = result.content.data;
      this.configsTotal = result.content.count;
    } else {
      this.frameworkService.messageService.error(
        result.message || this.messages.GET_CONFIGS_FAILED,
      );
    }
  }

  public async createConfig() {
    const params = this.getParams();
    const result = await this.httpClient
      .post<IResult<ConfigModel>>('/api/v1/system/configs', params)
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

  public async updateConfig(id: number) {
    const params = this.getParams();
    const result = await this.httpClient
      .put<IResult<ConfigModel>>(`/api/v1/system/configs/${id}`, params)
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

  public async deleteConfig(id: number) {
    this.deletedConfigId = id;
    const result = await this.httpClient
      .delete<IResult<ConfigModel>>(`/api/v1/system/configs/${id}`)
      .toPromise();
    const succeed = result.code === HTTP_STATUS_CODE_ENUM.NO_CONTENT;
    if (succeed) {
      await this.frameworkService.messageService.success(this.messages.DELETE_SUCCEED);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.DELETE_FAILED,
      );
    }
    this.deletedConfigId = 0;
    await this.getConfigsAndCount(1);
  }

  public reset() {
    this.searchConfigForm.reset();
    this.getConfigsAndCount(1);
  }

  public search() {
    this.getConfigsAndCount(1);
  }

  public openConfigModal(config?: ConfigModel) {
    this.config = config;
    let form = {};
    if (config) {
      form = {
        code: config.code,
        name: config.name,
        contentEncrypted: config.contentEncrypted,
        content: config.content,
        comment: config.comment,
      };
      logger.info('config', config);
    } else {
      form = {
        contentEncrypted: false,
      };
    }
    setTimeout(() => {
      this.configForm.reset(form);
    }, 0);
    this.configModalVisible = true;
  }

  public closeConfigModal() {
    this.configModalVisible = false;
    this.config = undefined;
  }

  public async saveConfigForm() {
    this.saveConfigLoading = true;
    const succeed = this.config
      ? await this.updateConfig(this.config.id)
      : await this.createConfig();
    if (succeed) {
      this.saveConfigLoading = false;
      this.configModalVisible = false;
      this.config = undefined;
      await this.getConfigsAndCount(1);
    } else {
      this.saveConfigLoading = false;
    }
  }
}
