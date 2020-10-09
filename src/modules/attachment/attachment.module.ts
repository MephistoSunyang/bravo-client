import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared';
import { FrameworkModule } from '../framework';
import { SystemModule } from '../system';
import { AttachmentRoutesModule } from './attachment-routes.module';
import { AttachmentsComponent } from './containers';

const modules = [SharedModule, FrameworkModule, SystemModule, AttachmentRoutesModule];
const components = [AttachmentsComponent];

@NgModule({
  imports: [...modules],
  declarations: [...components],
  exports: [RouterModule, ...components],
})
export class AttachmentModule {}
