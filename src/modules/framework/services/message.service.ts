import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

@Injectable()
export class MessageService {
  constructor(private readonly message: NzMessageService) {}

  private create(
    type: 'success' | 'info' | 'warning' | 'error',
    message: string,
    duration = 1000,
  ): Promise<void> {
    return new Promise((resolve) => {
      this.message.create(type, message, {
        nzDuration: 1000,
      });
      setTimeout(resolve, duration + 300);
    });
  }

  public success(message: string, delay?: number): Promise<void> {
    return this.create('success', message, delay);
  }

  public info(message: string, delay?: number): Promise<void> {
    return this.create('info', message, delay);
  }

  public warning(message: string, delay?: number): Promise<void> {
    return this.create('warning', message, delay);
  }

  public error(message: string, delay?: number): Promise<void> {
    return this.create('error', message, delay);
  }
}
