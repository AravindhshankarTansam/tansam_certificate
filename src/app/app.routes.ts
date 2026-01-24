import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './dashboard/layout/layout.component';
import { AdminComponent } from './dashboard/admin/admin.component';
import { AddUserComponent } from './dashboard/admin/add-user/add-user.component';
import { LabsComponent } from './dashboard/admin/master-table/labs/labs.component';
import { AddLeadsComponent } from './dashboard/admin/master-table/add-leads/add-leads.component';
import { CertificateSignatureComponent } from './dashboard/admin/master-table/certificate-signature/certificate-signature.component';
import { RolesComponent } from './dashboard/admin/master-table/roles/roles.component';
import { SubAdminComponent } from './dashboard/sub-admin/sub-admin.component';
import { SdpComponent } from './dashboard/sub-admin/program-intern/sdp/sdp.component';
import { FdpComponent } from './dashboard/sub-admin/program-intern/fdp/fdp.component';
import { IndustryComponent } from './dashboard/sub-admin/program-intern/industry/industry.component';
import { BulkUploadComponent } from './dashboard/sub-admin/bulk-upload/bulk-upload.component';
import { ReportsComponent } from './dashboard/sub-admin/reports/reports.component';



export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    component: LayoutComponent,
    children: [
      { path: 'admin/dashboard', component: AdminComponent },
      { path: 'admin/add-user', component: AddUserComponent },
      { path: 'admin/labs', component: LabsComponent },
      { path: 'admin/leads', component: AddLeadsComponent },
      { path: 'admin/signature', component: CertificateSignatureComponent },
      { path: 'admin/roles', component: RolesComponent },

      // Sub Admin Routes
      { path: 'sub-admin/dashboard', component: SubAdminComponent },
      { path: 'sub-admin/sdp', component: SdpComponent },
      { path: 'sub-admin/fdp', component: FdpComponent },
      { path: 'sub-admin/industry', component: IndustryComponent },
      { path: 'sub-admin/bulk-upload', component: BulkUploadComponent },
      { path: 'sub-admin/reports', component: ReportsComponent}
      // ... more routes can be added here ...

    ]
  },


];
