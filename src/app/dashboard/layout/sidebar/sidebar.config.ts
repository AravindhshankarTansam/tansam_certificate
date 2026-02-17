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
        { label: 'Roles', route: '/dashboard/admin/roles' },
        { label: 'holidays', route: '/dashboard/admin/holidays' },
      ]
    },
    { label: 'Generated Certificates',
      children: [
        { label: 'SDP', route: '/dashboard/admin/certificates/sdp' },
        { label: 'FDP', route: '/dashboard/admin/certificates/fdp' },
        { label: 'Industry', route: '/dashboard/admin/certificates/industry' },
        { label: 'Industrial Visits', route: '/dashboard/admin/certificates/industrial-visits' }
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
          label: 'General',
          children: [
            { label: 'SDP', route: '/dashboard/sub-admin/sdp' },
            { label: 'FDP', route: '/dashboard/sub-admin/fdp' },
            { label: 'Industry', route: '/dashboard/sub-admin/industry' }
          ]
        },
        // { label: 'Industry', route: '/dashboard/sub-admin/industry' }
          // ===== ACADEMIA (NEW) =====
      {
        label: 'Academia',
        children: [
          { label: 'SDP Bulk Upload', route: '/dashboard/sub-admin/sdp-bulk-upload' },
          { label: 'FDP Bulk Upload', route: '/dashboard/sub-admin/fdp-bulk-upload' },
          { label: 'Industry Bulk Upload', route: '/dashboard/sub-admin/industry-bulk-upload' }
        ]
      }

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
    label: 'Academia',
    children: [
      { label: 'SDP Bulk Upload', route: '/dashboard/teamlead/sdp-bulk-upload' },
      { label: 'FDP Bulk Upload', route: '/dashboard/teamlead/fdp-bulk-upload' },
      { label: 'Industry Bulk Upload', route: '/dashboard/teamlead/industry-bulk-upload' }
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
            { label: 'Industry', route: '/dashboard/finance/transactions/industry' },
            { label:'Industrial Visits', route: '/dashboard/finance/transactions/industrial-visits' }
          ]
        },
          {
        label: 'Academia',
        children: [
          { label: 'SDP Bulk Upload', route: '/dashboard/finance/transactions/sdp-bulk-upload' },
          { label: 'FDP Bulk Upload', route: '/dashboard/finance/transactions/fdp-bulk-upload' },
          { label: 'Industry Bulk Upload', route: '/dashboard/finance/transactions/industry-bulk-upload' }
        ]
      },

        { label: 'Reports', route: '/dashboard/finance/reports' }
      ]
    }
  ]




};
