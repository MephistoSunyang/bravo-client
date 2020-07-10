import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  NzButtonModule,
  NzDropDownModule,
  NzFormModule,
  NzGridModule,
  NzIconModule,
  NzInputModule,
  NzInputNumberModule,
  NzLayoutModule,
  NzMenuModule,
  NzModalModule,
  NzPopconfirmModule,
  NzResultModule,
  NzSelectModule,
  NzSpinModule,
  NzSwitchModule,
  NzTableModule,
  NzToolTipModule,
  NzTreeSelectModule,
  NzUploadModule,
} from 'ng-zorro-antd';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { FrameworkModule } from '../modules/framework';

const nzModules = [
  NzButtonModule,
  NzDropDownModule,
  NzFormModule,
  NzGridModule,
  NzIconModule,
  NzInputModule,
  NzInputNumberModule,
  NzLayoutModule,
  NzMenuModule,
  NzModalModule,
  NzPopconfirmModule,
  NzResultModule,
  NzSelectModule,
  NzSpinModule,
  NzSwitchModule,
  NzTableModule,
  NzToolTipModule,
  NzTreeSelectModule,
  NzUploadModule,
  NzSpaceModule,
];
const modules = [
  CommonModule,
  FormsModule,
  RouterModule,
  ReactiveFormsModule,
  HttpClientModule,
  FrameworkModule,
  ...nzModules,
];

@NgModule({
  imports: [...modules],
  exports: [...modules],
})
export class SharedModule {}
