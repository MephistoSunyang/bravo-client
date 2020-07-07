import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toBoolean',
})
export class ToBooleanPipe implements PipeTransform {
  public transform(
    value: boolean,
    display: { true: string; false: string } = { true: '是', false: '否' },
  ) {
    return value ? display.true : display.false;
  }
}
