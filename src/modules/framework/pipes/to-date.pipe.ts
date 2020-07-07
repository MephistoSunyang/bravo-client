import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'toDate',
})
export class ToDatePipe implements PipeTransform {
  public transform(date: any, format = 'YYYY-MM-DD') {
    return date ? moment(date).format(format) : '';
  }
}
