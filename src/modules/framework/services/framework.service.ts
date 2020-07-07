import { Injectable } from '@angular/core';
import { FormService } from './form.service';
import { HttpService } from './http.service';
import { MessageService } from './message.service';
import { RouterService } from './router.service';
import { SessionService } from './session.service';
import { StorageService } from './storage.service';

@Injectable()
export class FrameworkService {
  constructor(
    public readonly formService: FormService,
    public readonly httpService: HttpService,
    public readonly messageService: MessageService,
    public readonly routeService: RouterService,
    public readonly sessionService: SessionService,
    public readonly storageService: StorageService,
  ) {}
}
