import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'toTime',
})
export class ToTimePipe implements PipeTransform {
  public transform(date: string, format = 'YYYY-MM-DD HH:mm:ss') {
    return date ? moment(date).format(format) : '';
  }
}
