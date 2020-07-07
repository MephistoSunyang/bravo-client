import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import _ from 'lodash';
import { NzSelectOptionInterface, NzTreeNodeOptions } from 'ng-zorro-antd';
import { IObject, ITreeNodeOptions } from '../interfaces';
import { logger } from '../logger';

@Injectable()
export class FormService {
  public validateForm(formGroup: FormGroup): void {
    function validateFormGroup(group: FormGroup) {
      _.forIn(group.controls, (control) => {
        if (control instanceof FormArray) {
          validateFormArray(control);
        }
        if (control instanceof FormGroup) {
          validateFormGroup(control);
        }
        if (control instanceof FormControl) {
          validateFormControl(control);
        }
      });
    }
    function validateFormArray(array: FormArray) {
      _.forEach(array.controls, (control) => {
        if (control instanceof FormArray) {
          validateFormArray(control);
        }
        if (control instanceof FormGroup) {
          validateFormGroup(control);
        }
        if (control instanceof FormControl) {
          validateFormControl(control);
        }
      });
    }
    function validateFormControl(control: FormControl) {
      control.markAsDirty();
      control.updateValueAndValidity();
    }
    validateFormGroup(formGroup);
    logger.debug('validateForm', formGroup);
  }

  public getTreeNodes<IModel extends { id: number }>(
    collections: IModel[],
    parentIdField: keyof IModel,
    childrenField: keyof IModel,
  ): (IModel & { level: number; expand: boolean; parent?: IModel })[] {
    return _.chain(collections)
      .filter((collection) => _.toNumber(collection[parentIdField]) === 0)
      .map((collection) => {
        const stack: (IModel & { level: number; expand: boolean; parent?: IModel })[] = [];
        const flatMapCollections: (IModel & {
          level: number;
          expand: boolean;
          parent?: IModel;
        })[] = [];
        stack.push({ ...collection, level: 0, expand: false });
        while (stack.length !== 0) {
          const parentCollection = stack.pop()!;
          const childCollections = _.filter(
            collections,
            (collection) => _.toNumber(collection[parentIdField]) === parentCollection.id,
          );
          if (!_.some(flatMapCollections, { id: parentCollection.id })) {
            parentCollection[childrenField] = childCollections as any;
            flatMapCollections.push(parentCollection);
          }
          if (childCollections.length !== 0) {
            _.forEachRight(childCollections, (childCollection) => {
              stack.push({
                ...childCollection,
                level: parentCollection.level + 1,
                expand: false,
                parent: parentCollection,
              });
            });
          }
        }
        return flatMapCollections;
      })
      .flatMap((flatMapCollections) => flatMapCollections)
      .value();
  }

  public getSelectOptionsByEnums(enums: IObject): NzSelectOptionInterface[] {
    const options: NzSelectOptionInterface[] = _.values(enums).map((value) => ({
      label: value,
      value,
    }));
    return options;
  }

  public getSelectOptionsByArray(array: any[]): NzSelectOptionInterface[] {
    const options: NzSelectOptionInterface[] = _.map(array, (item) => {
      const option: NzSelectOptionInterface = {
        label: _.toString(item),
        value: _.toString(item),
      };
      return option;
    });
    return options;
  }

  public getSelectOptionsByCollections(
    collections: any[],
    valueField = 'id',
    labelField = 'name',
  ): NzSelectOptionInterface[] {
    const options: NzSelectOptionInterface[] = _.map(collections, (collection) => {
      const option: NzSelectOptionInterface = {
        label: _.toString(collection[labelField]),
        value: _.toString(collection[valueField]),
      };
      return option;
    });
    return options;
  }

  public getTreeNodeOptions<IModel extends { id: number }>(
    collections: IModel[],
    parentId: number,
    options?: ITreeNodeOptions<IModel>,
  ) {
    const defaultOptions: ITreeNodeOptions<any> = {
      keyField: 'id',
      titleField: 'name',
      parentIdField: 'parentId',
      firstOption: null,
    };
    const { keyField, titleField, parentIdField, firstOption } = _.extend(defaultOptions, options);
    const treeNodeOptions: NzTreeNodeOptions[] = _.chain(collections)
      .filter(
        (collection) =>
          parentIdField !== undefined && _.toNumber(collection[parentIdField]) === parentId,
      )
      .map((collection) => {
        const children = this.getTreeNodeOptions(
          collections,
          collection.id,
          _.extend(options, { firstOption: null }),
        );
        return {
          key: _.toString(collection[keyField!]),
          title: _.toString(collection[titleField!]),
          children,
        };
      })
      .value();
    return firstOption ? [firstOption].concat(treeNodeOptions) : treeNodeOptions;
  }

  public getSelectedCollections<IModel extends { id: number }>(
    selectedIds: string[],
    collections: IModel[],
    parentIdField: keyof IModel,
  ): IModel[] {
    let selectedCollections: IModel[] = [];
    const getSubCollectionsByParentId = (parentId: number, collections: IModel[]): IModel[] => {
      let childCollections = _.filter(
        collections,
        (collection) => _.toNumber(collection[parentIdField]) === parentId,
      );
      if (childCollections.length === 0) {
        return childCollections;
      }
      _.forEach(childCollections, (subCollection) => {
        childCollections = _.concat(
          childCollections,
          getSubCollectionsByParentId(_.toNumber(subCollection.id), collections),
        );
      });
      return childCollections;
    };
    _.forEach(selectedIds, (selectedId) => {
      const collection = _.find(
        collections,
        (collection) => collection.id === _.toNumber(selectedId),
      );
      if (collection) {
        selectedCollections = _.concat(
          selectedCollections,
          [collection],
          getSubCollectionsByParentId(_.toNumber(collection.id), collections),
        );
      }
    });
    return _.sortBy(selectedCollections, 'id');
  }
}
