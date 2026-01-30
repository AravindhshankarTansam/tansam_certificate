import { Routes } from '@angular/router';
import { DashboardComponent } from './Teamlead/dashboard/dashboard.component';
import { AttendanceComponent } from './Teamlead/attendance/attendance.component';
import { CertificateComponent } from './Teamlead/certificate/certificate.component';
import { VerifyComponent } from './Teamlead/verify/verify.component';
import { teamLeadGuard } from './team-lead.guard';

export const routes: Routes = [

  // 🔓 PUBLIC ROUTE
  {
    path: 'verify/:certificateNo',
    component: VerifyComponent
  },

  // 🔐 TEAM LEAD AREA (Protected)
  {
    path: '',
    canActivate: [teamLeadGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // 👈 DEFAULT
      { path: 'dashboard', component: DashboardComponent },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'certificate', component: CertificateComponent },
    ]
  },

  // ❌ UNAUTHORIZED
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./unauthorized/unauthorized.component')
        .then(m => m.UnauthorizedComponent)
  },

  // ❗ WILDCARD
  {
    path: '**',
    redirectTo: '',
  }
];

