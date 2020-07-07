import { EventEmitter, Injectable } from '@angular/core';
import { IObject } from '../interfaces';

@Injectable()
export class StorageService {
  public static storages: IObject = {};
  public eventEmitter = new EventEmitter();

  public emit(): void {
    this.eventEmitter.emit(StorageService.storages);
  }

  public on(key: string, callback: (value: any) => void): void {
    callback(this.get(key));
    this.eventEmitter.subscribe((storages: IObject) => {
      callback(storages[key]);
    });
  }

  public has(key: string): boolean {
    return StorageService.storages[key] ? true : false;
  }

  public get<IValue = any>(key: string): IValue | null {
    return this.has(key) ? StorageService.storages[key] : null;
  }

  public set(key: string, value: any): void {
    StorageService.storages[key] = value;
    this.emit();
  }
}
