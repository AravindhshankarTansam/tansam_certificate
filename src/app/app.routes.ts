import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './dashboard/layout/layout.component';
import { AdminComponent } from './dashboard/admin/admin.component';
import { UserComponent } from './dashboard/user/user.component';
import { ManagerComponent } from './dashboard/manager/manager.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
  path: 'dashboard',
  component: LayoutComponent,
  children: [
    { path: 'admin', component: AdminComponent },
    { path: 'user', component: UserComponent },
    { path: 'manager', component: ManagerComponent }
  ]
}

];

