import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FrameworkService, HTTP_STATUS_CODE_ENUM, IResult } from '../../../framework';
import { LOGS_MESSAGE } from './logs.message';

@Component({
  templateUrl: './logs.template.html',
})
export class LogsComponent implements OnInit {
  public messages = LOGS_MESSAGE;
  public logsLoading = false;
  public logs: string[];

  constructor(
    private readonly httpClient: HttpClient,
    private readonly frameworkService: FrameworkService,
  ) {}

  public ngOnInit() {
    this.getLogs();
  }

  public async getLogs() {
    this.logsLoading = true;
    const result = await this.httpClient.get<IResult>('api/v1/system/logs').toPromise();
    this.logsLoading = false;
    if (result.code === HTTP_STATUS_CODE_ENUM.OK) {
      this.logs = result.content;
    } else {
      this.frameworkService.messageService.error(result.message || this.messages.GET_LOGS_FAILED);
    }
  }

  public async downloadLog(log: string) {
    this.frameworkService.httpService.downloadWithToken(`api/v1/system/logs/${log}`, log);
  }
}
