import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared';
import { FrameworkModule } from '../framework';
import { SystemMenusComponent } from './components';
import {
  ActionsComponent,
  ConfigsComponent,
  HomeComponent,
  LayoutComponent,
  LogsComponent,
  MenusComponent,
  PermissionsComponent,
  RoleGroupsComponent,
  RolesComponent,
  UsersComponent,
} from './containers';
import { TokenGuard } from './guards';
import { LayoutService, MenuService } from './services';
import { SystemRoutesModule } from './system-routes.module';

const modules = [SharedModule, FrameworkModule, SystemRoutesModule];
const components = [
  ActionsComponent,
  ConfigsComponent,
  HomeComponent,
  LayoutComponent,
  LogsComponent,
  MenusComponent,
  SystemMenusComponent,
  PermissionsComponent,
  RoleGroupsComponent,
  RolesComponent,
  UsersComponent,
];
const services = [LayoutService, MenuService];
const guards = [TokenGuard];
const providers = [...guards, ...services];

@NgModule({
  imports: [...modules],
  declarations: [...components],
  providers,
  exports: [RouterModule, ...components],
})
export class SystemModule {}
