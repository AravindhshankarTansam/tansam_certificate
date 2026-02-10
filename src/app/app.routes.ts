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
import { FinanceDashboardComponent } from './dashboard/finance/finance-dashboard/finance-dashboard.component';
import { TransactionsComponent } from './dashboard/finance/transactions/transactions.component';
import { FinancereportsComponent } from './dashboard/finance/financereports/financereports.component';
import { TransactionsSdpComponent } from './dashboard/finance/transactions/transactions-sdp/transactions-sdp.component';
import { TransactionsFdpComponent } from './dashboard/finance/transactions/transactions-fdp/transactions-fdp.component';
import { TransactionsIndustryComponent } from './dashboard/finance/transactions/transactions-industry/transactions-industry.component';
import { HolidayComponent } from './dashboard/admin/master-table/holiday/holidays.component';
// Team Lead
import { TeamLeadDashboardComponent } from './dashboard/team-lead/team-lead-dashboard/team-lead-dashboard.component';
import { TlSdpComponent } from './dashboard/team-lead/attendance/tl-sdp/tl-sdp.component';
import { TlFdpComponent } from './dashboard/team-lead/attendance/tl-fdp/tl-fdp.component';
import { TlIndustryComponent } from './dashboard/team-lead/attendance/tl-industry/tl-industry.component';
import { TlNotEligibleComponent } from './dashboard/team-lead/reports/tl-not-eligible/tl-not-eligible.component';
import { VerifyComponent } from './dashboard/verify/verify.component';
import { TransactionsIndustrialVisitsComponent } from './dashboard/finance/transactions/transactions-industrial-visits/transactions-industrial-visits.component';



export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'verify/:certNo', component: VerifyComponent },

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
      { path: 'admin/holidays', component: HolidayComponent },
      // Sub Admin Routes
      { path: 'sub-admin/dashboard', component: SubAdminComponent },
      { path: 'sub-admin/sdp', component: SdpComponent },
      { path: 'sub-admin/fdp', component: FdpComponent },
      { path: 'sub-admin/industry', component: IndustryComponent },
      { path: 'sub-admin/bulk-upload', component: BulkUploadComponent },
      { path: 'sub-admin/reports', component: ReportsComponent },
      // Team Lead Routes
      { path: 'teamlead/dashboard', component: TeamLeadDashboardComponent },
      { path: 'teamlead/sdp', component: TlSdpComponent },
      { path: 'teamlead/fdp', component: TlFdpComponent },
      { path: 'teamlead/industry', component: TlIndustryComponent },
      { path: 'teamlead/not-eligible', component: TlNotEligibleComponent },

      // Finance Routes
      { path: 'finance/dashboard', component: FinanceDashboardComponent },
      {
        path: 'finance/transactions',
        component: TransactionsComponent,
        children: [
          { path: 'sdp', component: TransactionsSdpComponent },
          { path: 'fdp', component: TransactionsFdpComponent },
          { path: 'industry', component: TransactionsIndustryComponent },
          { path: 'industrial-visits', component: TransactionsIndustrialVisitsComponent },
          { path: '', redirectTo: 'sdp', pathMatch: 'full' }
        ]
      },
      { path: 'finance/reports', component: FinancereportsComponent },

    ]
  },


];
