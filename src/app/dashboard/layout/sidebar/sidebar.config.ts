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
    { label: 'Dashboard Home', route: '/dashboard' },

    {
      label: 'Program Intern',
      children: [
        {
          label: 'Academic',
          children: [
            { label: 'SDP', route: '/sdp' },
            { label: 'FDP', route: '/fdp' }
          ]
        },
        { label: 'Industry', route: '/industry' }
      ]
    },

    { label: 'Bulk Upload', route: '/bulk-upload' }
  ],

  // ================= TEAM LEAD =================
  TL: [
    { label: 'Dashboard Home', route: '/dashboard' },
    { label: 'Attendance', route: '/attendance' },
    { label: 'Not Eligible List', route: '/not-eligible' }
  ],

  // ================= FINANCE =================
  FINANCE: [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Transaction', route: '/transactions' }
  ]
};
