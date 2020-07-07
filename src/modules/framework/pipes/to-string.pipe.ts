import { Pipe, PipeTransform } from '@angular/core';
import _ from 'lodash';

@Pipe({
  name: 'toString',
})
export class ToStringPipe implements PipeTransform {
  public transform(value: any) {
    return _.toString(value);
  }
}
