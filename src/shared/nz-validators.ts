import { AbstractControl, AsyncValidatorFn, ValidatorFn, Validators } from '@angular/forms';
import _ from 'lodash';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, map, mergeMap, take } from 'rxjs/operators';
import { IResult } from '../modules/framework';

export type NzValidationErrors = Record<string, { 'zh-cn': string }>;

export class NzValidators {
  public static required(message: string): ValidatorFn {
    return (control: AbstractControl): NzValidationErrors | null => {
      if (Validators.required(control) === null) {
        return null;
      }
      return { required: { 'zh-cn': message } };
    };
  }

  public static phone(message: string): ValidatorFn {
    return (control: AbstractControl): NzValidationErrors | null => {
      const reg = /^1(3[0-9]|4[5,7]|5[0,1,2,3,5,6,7,8,9]|6[2,5,6,7]|7[0,1,7,8]|8[0-9]|9[1,8,9])\d{8}$/;
      if (!control.value || reg.test(control.value)) {
        return null;
      }
      return { phone: { 'zh-cn': message } };
    };
  }

  public static email(message: string): ValidatorFn {
    return (control: AbstractControl): NzValidationErrors | null => {
      if (!control.value || Validators.email(control) === null) {
        return null;
      }
      return { email: { 'zh-cn': message } };
    };
  }

  public static different(compareField: string, message: string): ValidatorFn {
    return (control: AbstractControl): NzValidationErrors | null => {
      if (
        control.parent &&
        control.parent.value[compareField] &&
        control.value === control.parent.value[compareField]
      ) {
        return null;
      }
      return { different: { 'zh-cn': message } };
    };
  }

  public static unique(
    validatorService: (value: string) => Observable<IResult<any[]> | null>,
    message: string,
  ): AsyncValidatorFn {
    return (
      control: AbstractControl,
    ): Promise<NzValidationErrors | null> | Observable<NzValidationErrors | null> => {
      if (!control.valueChanges) {
        return of(null);
      }
      return control.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        take(1),
        mergeMap((value) => {
          return value ? validatorService(value) : of(null);
        }),
        map((result) => {
          return result && result.content.length === 1 ? { unique: { 'zh-cn': message } } : null;
        }),
        first(),
      );
    };
  }
}
