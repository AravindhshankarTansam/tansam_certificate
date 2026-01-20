import { Routes } from '@angular/router';
import { RoleComponent } from './pages/role/role.component';
import { LabComponent } from './pages/lab/lab.component';
import { CreateUserComponent } from './pages/create-user/create-user.component';

export const routes: Routes = [
  { path: 'create-user', component: CreateUserComponent },
  { path: 'role', component: RoleComponent },
  { path: 'lab', component: LabComponent },
  { path: '', redirectTo: 'role', pathMatch: 'full' }
];
