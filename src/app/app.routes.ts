import { Routes } from '@angular/router';
import { DashboardComponent } from './Teamlead/dashboard/dashboard.component';
import { AttendanceComponent } from './Teamlead/attendance/attendance.component';
import { teamLeadGuard } from './team-lead.guard';
import { CertificateComponent } from './Teamlead/certificate/certificate.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [teamLeadGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'attendance',
        component: AttendanceComponent
      },
        {
        path: 'certificate',
        component: CertificateComponent   // ✅ ADDED
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./unauthorized/unauthorized.component').then(
        m => m.UnauthorizedComponent
      )
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
