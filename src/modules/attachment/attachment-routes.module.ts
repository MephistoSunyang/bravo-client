import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { LayoutComponent, TokenGuard } from '../system';
import { AttachmentsComponent } from './containers';

const routes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [{ path: 'attachments', component: AttachmentsComponent }],
    canActivate: [TokenGuard],
    canActivateChild: [TokenGuard],
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
})
export class AttachmentRoutesModule {}
