import { Pipe, PipeTransform } from '@angular/core';
import _ from 'lodash';

@Pipe({
  name: 'toSize',
})
export class ToSizePipe implements PipeTransform {
  public transform(size: number, unit = 'MB', radix = 2) {
    // const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    return `${_.toNumber((size / 1024 / 1024).toFixed(radix))}${unit}`;
  }
}
