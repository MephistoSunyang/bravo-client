import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { ISessionItem } from '../interfaces';

@Injectable()
export class SessionService {
  public session = window.localStorage;

  private sessionItemExpires(key: string): boolean {
    const sessionItem = this.getSessionItem(key);
    return sessionItem ? sessionItem && Date.now() > sessionItem.expiresAt : true;
  }

  private createSessionItem(content: any): ISessionItem {
    const expiresAt = Date.now() + environment.ttl * 1000;
    const contentType = typeof content;
    if (contentType === 'object') {
      content = JSON.stringify(content);
    }
    const sessionItem: ISessionItem = {
      content,
      contentType,
      expiresAt,
    };
    return sessionItem;
  }

  private getSessionItem(key: string): ISessionItem | null {
    const session = this.session.getItem(key);
    if (!session) {
      return null;
    }
    const sessionItem: ISessionItem = JSON.parse(session);
    if (sessionItem.contentType === 'object') {
      sessionItem.content = JSON.parse(sessionItem.content);
    }
    return sessionItem;
  }

  public get<IValue = any>(key: string): IValue | null {
    const sessionItem = this.getSessionItem(key);
    return this.has(key) && !this.sessionItemExpires(key) && sessionItem
      ? sessionItem.content
      : null;
  }

  public set(key: string, value: any): void {
    if (this.has(key)) {
      this.remove(key);
    }
    this.session.setItem(key, JSON.stringify(this.createSessionItem(value)));
  }

  public remove(key: string): void {
    this.session.removeItem(key);
  }

  public has(key: string): boolean {
    if (this.session[key] === undefined) {
      return false;
    }
    if (this.sessionItemExpires(key)) {
      this.remove(key);
      return false;
    }
    return true;
  }

  public clear(): void {
    this.session.clear();
  }
}
