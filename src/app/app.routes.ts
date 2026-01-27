import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './dashboard/layout/layout.component';
import { AdminComponent } from './dashboard/admin/admin.component';
import { AddUserComponent } from './dashboard/admin/add-user/add-user.component';

// MASTER TABLE
import { LabsComponent } from './dashboard/admin/master-table/labs/labs.component';
import { AddLeadsComponent } from './dashboard/admin/master-table/add-leads/add-leads.component';
import { CertificateSignatureComponent } from './dashboard/admin/master-table/certificate-signature/certificate-signature.component';
import { RolesComponent } from './dashboard/admin/master-table/roles/roles.component';
import { HolidaysComponent } from './dashboard/admin/master-table/holidays/holidays.component';

// SUB ADMIN
import { SubAdminComponent } from './dashboard/sub-admin/sub-admin.component';
import { SdpComponent } from './dashboard/sub-admin/program-intern/sdp/sdp.component';
import { FdpComponent } from './dashboard/sub-admin/program-intern/fdp/fdp.component';
import { IndustryComponent } from './dashboard/sub-admin/program-intern/industry/industry.component';
import { BulkUploadComponent } from './dashboard/sub-admin/bulk-upload/bulk-upload.component';
import { ReportsComponent } from './dashboard/sub-admin/reports/reports.component';

// FINANCE
import { FinanceDashboardComponent } from './dashboard/finance/finance-dashboard/finance-dashboard.component';
import { TransactionsComponent } from './dashboard/finance/transactions/transactions.component';
import { FinancereportsComponent } from './dashboard/finance/financereports/financereports.component';
import { TransactionsSdpComponent } from './dashboard/finance/transactions/transactions-sdp/transactions-sdp.component';
import { TransactionsFdpComponent } from './dashboard/finance/transactions/transactions-fdp/transactions-fdp.component';
import { TransactionsIndustryComponent } from './dashboard/finance/transactions/transactions-industry/transactions-industry.component';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    component: LayoutComponent,
    children: [

      // ================= ADMIN =================
      { path: 'admin/dashboard', component: AdminComponent },
      { path: 'admin/add-user', component: AddUserComponent },

      // ✅ MASTER TABLE ROUTES
      { path: 'admin/master-table/labs', component: LabsComponent },
      { path: 'admin/master-table/add-leads', component: AddLeadsComponent },
      { path: 'admin/master-table/certificate-signature', component: CertificateSignatureComponent },
      { path: 'admin/master-table/roles', component: RolesComponent },
      { path: 'admin/master-table/holidays', component: HolidaysComponent }, // ✅ NEW

      // ================= SUB ADMIN =================
      { path: 'sub-admin/dashboard', component: SubAdminComponent },
      { path: 'sub-admin/sdp', component: SdpComponent },
      { path: 'sub-admin/fdp', component: FdpComponent },
      { path: 'sub-admin/industry', component: IndustryComponent },
      { path: 'sub-admin/bulk-upload', component: BulkUploadComponent },
      { path: 'sub-admin/reports', component: ReportsComponent },

      // ================= FINANCE =================
      { path: 'finance/dashboard', component: FinanceDashboardComponent },

      {
        path: 'finance/transactions',
        component: TransactionsComponent,
        children: [
          { path: 'sdp', component: TransactionsSdpComponent },
          { path: 'fdp', component: TransactionsFdpComponent },
          { path: 'industry', component: TransactionsIndustryComponent },
          { path: '', redirectTo: 'sdp', pathMatch: 'full' }
        ]
      },

      { path: 'finance/reports', component: FinancereportsComponent }
    ]
  }
];
