import { Pipe, PipeTransform } from '@angular/core';
import _ from 'lodash';

@Pipe({
  name: 'find',
})
export class FindPipe implements PipeTransform {
  public transform(value: any, collections: any[], valueField = 'id', nameField = 'name') {
    const collection = _.find(
      collections,
      (collection) => _.toString(collection[valueField]) === _.toString(value),
    );
    return collection && collection[nameField] ? collection[nameField] : null;
  }
}
