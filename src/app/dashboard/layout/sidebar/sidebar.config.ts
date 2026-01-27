export interface MenuItem {
  label: string;
  route?: string;
  children?: MenuItem[];
  open?: boolean;
}

export const ROLE_MENUS: Record<string, MenuItem[]> = {

  // ================= ADMIN =================
  ADMIN: [
    { label: 'Dashboard Home', route: '/dashboard/admin/dashboard' },
    { label: 'Add User', route: '/dashboard/admin/add-user' },

    {
      label: 'Master Table',
      children: [
        { label: 'Labs', route: '/dashboard/admin/master-table/labs' },
        { label: 'Add Leads', route: '/dashboard/admin/master-table/add-leads' },
        { label: 'Certificate Signature', route: '/dashboard/admin/master-table/certificate-signature' },
        { label: 'Roles', route: '/dashboard/admin/master-table/roles' },
        { label: 'Holidays', route: '/dashboard/admin/master-table/holidays' } // ✅ NEW
      ]
    }
  ],


  // ================= SUB ADMIN =================
  SUB_ADMIN: [
    { label: 'Dashboard Home', route: '/dashboard/sub-admin/dashboard' },

    {
      label: 'Program Intern',
      children: [
        {
          label: 'Academic',
          children: [
            { label: 'SDP', route: '/dashboard/sub-admin/sdp' },
            { label: 'FDP', route: '/dashboard/sub-admin/fdp' }
          ]
        },
        { label: 'Industry', route: '/dashboard/sub-admin/industry' }
      ]
    },

    { label: 'Bulk Upload', route: '/dashboard/sub-admin/bulk-upload' },
    { label: 'Reports', route: '/dashboard/sub-admin/reports' }
  ],


  // ================= TEAM LEAD =================
  TL: [
    { label: 'Dashboard Home', route: '/dashboard/tl/dashboard' },
    { label: 'Attendance', route: '/dashboard/tl/attendance' },
    { label: 'Not Eligible List', route: '/dashboard/tl/not-eligible' }
  ],


  // ================= FINANCE =================
  FINANCE: [
    { label: 'Dashboard Home', route: '/dashboard/finance/dashboard' },

    {
      label: 'Accounts',
      children: [
        {
          label: 'Transactions',
          children: [
            { label: 'SDP', route: '/dashboard/finance/transactions/sdp' },
            { label: 'FDP', route: '/dashboard/finance/transactions/fdp' },
            { label: 'Industry', route: '/dashboard/finance/transactions/industry' }
          ]
        },
        { label: 'Reports', route: '/dashboard/finance/reports' }
      ]
    }
  ]
};
