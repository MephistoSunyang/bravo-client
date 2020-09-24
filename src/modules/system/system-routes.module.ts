import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import {
  ActionsComponent,
  AttachmentsComponent,
  ConfigsComponent,
  HomeComponent,
  LayoutComponent,
  LogsComponent,
  MenusComponent,
  PermissionsComponent,
  RoleGroupsComponent,
  RolesComponent,
  UsersComponent,
} from './components';
import { AccessTokenGuard } from './guards';

const routes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'users', component: UsersComponent },
      { path: 'roleGroups', component: RoleGroupsComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'menus', component: MenusComponent },
      { path: 'permissions', component: PermissionsComponent },
      { path: 'actions', component: ActionsComponent },
      { path: 'configs', component: ConfigsComponent },
      { path: 'logs', component: LogsComponent },
      { path: 'attachments', component: AttachmentsComponent },
    ],
    canActivate: [AccessTokenGuard],
    canActivateChild: [AccessTokenGuard],
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
})
export class SystemRoutesModule {}
