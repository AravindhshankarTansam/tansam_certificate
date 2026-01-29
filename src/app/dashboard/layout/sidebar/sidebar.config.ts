export interface MenuItem {
  label: string;
  route?: string;       // clickable
  children?: MenuItem[]; // dropdown
  open?: boolean;
}

export const ROLE_MENUS: Record<string, MenuItem[]> = {

  // ================= ADMIN =================
  ADMIN: [
    { label: 'Dashboard Home', route: 'admin/dashboard' },
    { label: 'Add User', route: 'admin/add-user' },
    {
      label: 'Master Table',
      children: [
        { label: 'Labs', route: '/dashboard/admin/labs' },
        { label: 'Add Leads', route: '/dashboard/admin/leads' },
        { label: 'Certificate Signature', route: '/dashboard/admin/signature' },
        { label: 'Roles', route: '/dashboard/admin/roles' }
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
TEAM_LEAD: [
  { label: 'Dashboard Home', route: '/dashboard/teamlead/dashboard' },

  {
    label: 'Attendance',
    children: [
      { label: 'SDP', route: '/dashboard/teamlead/sdp' },
      { label: 'FDP', route: '/dashboard/teamlead/fdp' },
      { label: 'Industry', route: '/dashboard/teamlead/industry' }
    ]
  },

  {
    label: 'Reports',
    children: [
      { label: 'Not Eligible List', route: '/dashboard/teamlead/not-eligible' }
    ]
  }
],

  // ================= FINANCE =================
  FINANCE: [
    { label: 'Dashboard Home', route: '/dashboard/finance/dashboard' },

    {
      label: 'Accounts',
      children: [

        {
          label: 'Transactions',   // 👈 parent dropdown
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
