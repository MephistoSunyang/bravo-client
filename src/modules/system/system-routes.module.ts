import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import {
  ActionsComponent,
  AttachmentsComponent,
  ConfigsComponent,
  FeaturesComponent,
  HomeComponent,
  LayoutComponent,
  LogsComponent,
  MenusComponent,
  PermissionsComponent,
  RoleGroupsComponent,
  RolesComponent,
  UsersComponent,
} from './components';
import { AuthenticationGuard } from './guards';

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
      { path: 'features', component: FeaturesComponent },
      { path: 'menus', component: MenusComponent },
      { path: 'permissions', component: PermissionsComponent },
      { path: 'actions', component: ActionsComponent },
      { path: 'configs', component: ConfigsComponent },
      { path: 'logs', component: LogsComponent },
      { path: 'attachments', component: AttachmentsComponent },
    ],
    canActivate: [AuthenticationGuard],
    canActivateChild: [AuthenticationGuard],
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
})
export class SystemRoutesModule {}
