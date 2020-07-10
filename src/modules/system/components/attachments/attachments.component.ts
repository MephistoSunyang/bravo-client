import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NzSelectOptionInterface } from 'ng-zorro-antd';
import { UploadFile } from 'ng-zorro-antd/upload';
import { NzValidators } from '../../../../shared';
import {
  FrameworkService,
  HTTP_STATUS_CODE_ENUM,
  IDataAndCount,
  IResult,
  ISelectOption,
  logger,
} from '../../../framework';
import { AttachmentModel } from '../../models';
import { ATTACHMENTS_MESSAGE } from './attachments.message';

@Component({
  templateUrl: './attachments.template.html',
})
export class AttachmentsComponent implements OnInit {
  public messages = ATTACHMENTS_MESSAGE;
  public storageTypes: ISelectOption[] = [];
  public storageTypeOptions: NzSelectOptionInterface[] = [];
  public searchAttachmentForm: FormGroup;
  public attachments: AttachmentModel[] = [];
  public attachmentsTotal = 0;
  public attachmentsPageNumber = 1;
  public attachmentsPageSize = 10;
  public attachmentsLoading = false;
  public deletedAttachmentId = 0;
  public attachmentModalVisible = false;
  public files: UploadFile[] = [];
  public attachmentForm: FormGroup;
  public saveAttachmentLoading = false;
  public saveAttachmentDisabled = false;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly frameworkService: FrameworkService,
  ) {}

  private searchAttachmentFormBuilder() {
    this.searchAttachmentForm = new FormGroup({
      encoding: new FormControl(null),
      mimeType: new FormControl(null),
      folderName: new FormControl(null),
      fileName: new FormControl(null),
      extName: new FormControl(null),
      storageType: new FormControl(null),
    });
  }

  private attachmentFormBuilder() {
    this.attachmentForm = new FormGroup({
      storageType: new FormControl(null, [
        NzValidators.required(this.messages.STORAGE_TYPE_REQUIRED),
      ]),
      file: new FormControl(null, [NzValidators.required(this.messages.FILE_REQUIRED)]),
    });
    this.attachmentForm.statusChanges.subscribe((status) => {
      this.saveAttachmentDisabled = status !== 'VALID';
    });
  }

  private async getOptions() {
    const result = await this.httpClient
      .get<IResult<ISelectOption[]>>('api/v1/attachments/storageTypes')
      .toPromise();
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.storageTypes = result.content;
      this.storageTypeOptions = this.frameworkService.formService.getSelectOptionsByCollections(
        result.content,
        'value',
        'name',
      );
      logger.info('[storageTypes]', this.storageTypes);
      logger.info('[storageTypeOptions]', this.storageTypeOptions);
    } else {
      this.frameworkService.messageService.error(this.messages.GET_OPTIONS_FAILED);
    }
  }

  public ngOnInit() {
    this.searchAttachmentFormBuilder();
    this.attachmentFormBuilder();
    this.getOptions();
    this.getAttachmentsAndCount();
  }

  public async getAttachmentsAndCount(
    pageNumber = this.attachmentsPageNumber,
    pageSize = this.attachmentsPageSize,
  ) {
    this.attachmentsLoading = true;
    this.attachmentsPageNumber = pageNumber;
    this.attachmentsPageSize = pageSize;
    const {
      encoding,
      mimeType,
      folderName,
      fileName,
      extName,
      storageType,
    } = this.searchAttachmentForm.value;
    const params = this.frameworkService.httpService.createHttpParams({
      encoding: encoding ? `%${encoding}%` : null,
      mimeType: mimeType ? `%${mimeType}%` : null,
      folderName: folderName ? `%${folderName}%` : null,
      fileName: fileName ? `%${fileName}%` : null,
      extName: extName ? `%${extName}%` : null,
      storageType,
      pageNumber: this.attachmentsPageNumber,
      pageSize: this.attachmentsPageSize,
    });
    const result = await this.httpClient
      .get<IResult<IDataAndCount<AttachmentModel>>>('api/v1/attachments/andCount', {
        params,
      })
      .toPromise();
    this.attachmentsLoading = false;
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.attachments = result.content.data;
      this.attachmentsTotal = result.content.count;
    } else {
      this.frameworkService.messageService.error(
        result.message || this.messages.GET_ATTACHMENTS_FAILED,
      );
    }
  }

  public async deleteAttachment(id: number) {
    this.deletedAttachmentId = id;
    const result = await this.httpClient
      .delete<IResult<AttachmentModel>>(`/api/v1/attachments/${id}`)
      .toPromise();
    const succeed = result.code === HTTP_STATUS_CODE_ENUM.NO_CONTENT;
    if (succeed) {
      await this.frameworkService.messageService.success(this.messages.DELETE_SUCCEED);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.DELETE_FAILED,
      );
    }
    this.deletedAttachmentId = 0;
    await this.getAttachmentsAndCount(1);
  }

  public reset() {
    this.searchAttachmentForm.reset();
    this.getAttachmentsAndCount(1);
  }

  public search() {
    this.getAttachmentsAndCount(1);
  }

  public openAttachmentModal() {
    this.files = [];
    this.attachmentForm.reset({});
    this.attachmentModalVisible = true;
  }

  public closeAttachmentModal() {
    this.attachmentModalVisible = false;
  }

  public beforeUpload = (file: UploadFile): boolean => {
    this.files = [file];
    const fileControl = this.attachmentForm.get('file');
    if (fileControl) {
      fileControl.setValue(file.uid);
      fileControl.markAsDirty();
      fileControl.updateValueAndValidity();
    }
    return false;
  };

  public changeFile() {
    const fileControl = this.attachmentForm.get('file');
    if (fileControl) {
      fileControl.setValue(null);
      fileControl.markAsDirty();
      fileControl.updateValueAndValidity();
    }
  }

  public async saveAttachmentForm() {
    this.saveAttachmentLoading = true;
    const formData = new FormData();
    formData.append('files', this.files[0] as any);
    formData.append('storageType', this.attachmentForm.value.storageType);
    const result = await this.httpClient
      .post<IResult<AttachmentModel>>('api/v1/attachments', formData)
      .toPromise();
    if (result.code === HTTP_STATUS_CODE_ENUM.CREATED) {
      await this.frameworkService.messageService.success(this.messages.CREATE_SUCCEED);
      this.saveAttachmentLoading = false;
      this.attachmentModalVisible = false;
      await this.getAttachmentsAndCount(1);
    } else {
      await this.frameworkService.messageService.error(
        result.message || this.messages.CREATE_FAILED,
      );
      this.saveAttachmentLoading = false;
    }
  }
}
