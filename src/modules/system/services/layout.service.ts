import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class LayoutService {
  public refreshMenus: EventEmitter<any> = new EventEmitter();
}
