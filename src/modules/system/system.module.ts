import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared';
import { FrameworkModule } from '../framework';
import {
  ActionsComponent,
  AttachmentsComponent,
  ConfigsComponent,
  FeaturesComponent,
  HomeComponent,
  LayoutComponent,
  LogsComponent,
  MenuListComponent,
  MenusComponent,
  PermissionsComponent,
  RoleGroupsComponent,
  RolesComponent,
  UsersComponent,
} from './components';
import { AccessTokenGuard } from './guards';
import { LayoutService, MenuService } from './services';
import { SystemRoutesModule } from './system-routes.module';

const modules = [SharedModule, FrameworkModule, SystemRoutesModule];
const components = [
  ActionsComponent,
  AttachmentsComponent,
  ConfigsComponent,
  FeaturesComponent,
  HomeComponent,
  LayoutComponent,
  LogsComponent,
  MenusComponent,
  MenuListComponent,
  PermissionsComponent,
  RoleGroupsComponent,
  RolesComponent,
  UsersComponent,
];
const guards = [AccessTokenGuard];
const services = [LayoutService, MenuService];
const providers = [...guards, ...services];

@NgModule({
  imports: [...modules],
  declarations: [...components],
  providers,
  exports: [RouterModule, ...components],
})
export class SystemModule {}
