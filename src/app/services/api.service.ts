import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private BASE_URL = 'http://localhost:5055/api';

  constructor(private http: HttpClient) {}

  /* ========================
     AUTH
  ======================== */

  login(data: any) {
    return this.http.post(`${this.BASE_URL}/auth/login`, data, {
      withCredentials: true,
    });
  }

  /* ========================
     LABS (YOUR CUSTOM PATHS)
  ======================== */

  getLabs() {
    return this.http.get<any[]>(
      `${this.BASE_URL}/admin/master-table/labs/get`,
      { withCredentials: true },
    );
  }

  addLab(name: string) {
    return this.http.post(
      `${this.BASE_URL}/admin/master-table/labs/post`,
      { name },
      { withCredentials: true },
    );
  }

  updateLab(id: number, name: string) {
    return this.http.put(
      `${this.BASE_URL}/admin/master-table/labs/update/${id}`,
      { name },
      { withCredentials: true },
    );
  }
  /* ========================
   TEAM LEADS
  ======================== */

  getTeamLeads() {
    return this.http.get<any[]>(
      `${this.BASE_URL}/admin/master-table/team-leads/get`,
      { withCredentials: true },
    );
  }

  getLabsDropdown() {
    return this.http.get<any[]>(
      `${this.BASE_URL}/admin/master-table/team-leads/labs`,
      { withCredentials: true },
    );
  }

  addTeamLead(data: any) {
    return this.http.post(
      `${this.BASE_URL}/admin/master-table/team-leads/post`,
      data,
      { withCredentials: true },
    );
  }

  updateTeamLead(id: number, data: any) {
    return this.http.put(
      `${this.BASE_URL}/admin/master-table/team-leads/update/${id}`,
      data,
      { withCredentials: true },
    );
  }

  deleteTeamLead(id: number) {
    return this.http.delete(
      `${this.BASE_URL}/admin/master-table/team-leads/delete/${id}`,
      { withCredentials: true },
    );
  }

  /* ================= SIGNATURE ================= */

  getSignatures() {
    return this.http.get<any[]>(
      `${this.BASE_URL}/admin/master-table/certificate-signature/get`,
      { withCredentials: true },
    );
  }

  addSignature(data: FormData) {
    return this.http.post(
      `${this.BASE_URL}/admin/master-table/certificate-signature/post`,
      data,
      { withCredentials: true },
    );
  }

  updateSignature(id: number, data: FormData) {
    return this.http.put(
      `${this.BASE_URL}/admin/master-table/certificate-signature/update/${id}`,
      data,
      { withCredentials: true },
    );
  }
  /* ================= ROLES ================= */

  getRoles() {
    return this.http.get<any[]>(
      `${this.BASE_URL}/admin/master-table/roles/get`,
      { withCredentials: true },
    );
  }

  addRole(name: string) {
    return this.http.post(
      `${this.BASE_URL}/admin/master-table/roles/post`,
      { name },
      { withCredentials: true },
    );
  }

  updateRole(id: number, name: string) {
    return this.http.put(
      `${this.BASE_URL}/admin/master-table/roles/update/${id}`,
      { name },
      { withCredentials: true },
    );
  }

  deleteRole(id: number) {
    return this.http.delete(
      `${this.BASE_URL}/admin/master-table/roles/delete/${id}`,
      { withCredentials: true },
    );
  }

  /* ========================
   HOLIDAYS (ADMIN)
======================== */

getHolidays(year?: number, month?: number) {
  let url = `${this.BASE_URL}/admin/master-table/holidays/get`;

  if (year && month) {
    const m = String(month).padStart(2, '0');
    url += `?year=${year}&month=${m}`;
  }

  return this.http.get<any[]>(url, {
    withCredentials: true
  });
}

addHoliday(data: {
  holiday_date: string;
  holiday_name: string;
  type: 'G' | 'R';
}) {
  return this.http.post(
    `${this.BASE_URL}/admin/master-table/holidays/post`,
    data,
    { withCredentials: true }
  );
}

updateHoliday(id: number, data: any) {
  return this.http.put(
    `${this.BASE_URL}/admin/master-table/holidays/update/${id}`,
    data,
    { withCredentials: true }
  );
}

deleteHoliday(id: number) {
  return this.http.delete(
    `${this.BASE_URL}/admin/master-table/holidays/delete/${id}`,
    { withCredentials: true }
  );
}


  /* ================= USERS ================= */

  getUsers() {
    return this.http.get<any[]>(
      `${this.BASE_URL}/admin/master-table/users/get`,
      { withCredentials: true }
    );
  }

  getRoleDropdown() {
    return this.http.get<any[]>(
      `${this.BASE_URL}/admin/master-table/users/roles`,
      { withCredentials: true }
    );
  }

  addUser(data: any) {
    return this.http.post(
      `${this.BASE_URL}/admin/master-table/users/post`,
      data,
      { withCredentials: true }
    );
  }

  updateUser(id:number,data:any){
    return this.http.put(
      `${this.BASE_URL}/admin/master-table/users/update/${id}`,
      data,
      { withCredentials: true }
    );
  }

  /* ================= SDP (SUB ADMIN) ================= */

getSDP() {
  return this.http.get<any[]>(
    `${this.BASE_URL}/subadmin/sdp/get`,
    { withCredentials: true }
  );
}

addSDP(data: any) {
  return this.http.post(
    `${this.BASE_URL}/subadmin/sdp/post`,
    data,
    { withCredentials: true }
  );
}

updateSDP(id: number, data: any) {
  return this.http.put(
    `${this.BASE_URL}/subadmin/sdp/update/${id}`,
    data,
    { withCredentials: true }
  );
}

deleteSDP(id: number) {
  return this.http.delete(
    `${this.BASE_URL}/subadmin/sdp/delete/${id}`,
    { withCredentials: true }
  );
}

// ================= FDP (SUB ADMIN) ================= //

getFDP() {
  return this.http.get<any[]>(
    `${this.BASE_URL}/subadmin/fdp/get`,
    { withCredentials: true }
  );
}

addFDP(data: any) {
  return this.http.post(
    `${this.BASE_URL}/subadmin/fdp/post`,
    data,
    { withCredentials: true }
  );
}

updateFDP(id: number, data: any) {
  return this.http.put(
    `${this.BASE_URL}/subadmin/fdp/update/${id}`,
    data,
    { withCredentials: true }
  );
}

/* ================= INDUSTRY ================= */

getIndustry() {
  return this.http.get<any[]>(
    `${this.BASE_URL}/subadmin/industry/get`,
    { withCredentials: true }
  );
}

addIndustry(data: any) {
  return this.http.post(
    `${this.BASE_URL}/subadmin/industry/post`,
    data,
    { withCredentials: true }
  );
}

updateIndustry(id: number, data: any) {
  return this.http.put(
    `${this.BASE_URL}/subadmin/industry/update/${id}`,
    data,
    { withCredentials: true }
  );
}

/* ================= FINANCE PAYMENT UPDATE ================= */

getFinanceSDP() {
  return this.http.get<any[]>(
    `${this.BASE_URL}/finance/sdp`,
    { withCredentials: true }
  );
}

getFinanceFDP() {
  return this.http.get<any[]>(
    `${this.BASE_URL}/finance/fdp`,
    { withCredentials: true }
  );
}

getFinanceIndustry() {
  return this.http.get<any[]>(
    `${this.BASE_URL}/finance/industry`,
    { withCredentials: true }
  );
}


updatePayment(type: 'sdp' | 'fdp' | 'industry', id: number, body: any) {
  return this.http.put(
    `${this.BASE_URL}/finance/payment/${type}/${id}`,
    body,
    { withCredentials: true }
  );
}

/* ================= TEAM LEAD ATTENDANCE (DATE WISE) ================= */

/* ---------- SDP ---------- */

getTlSDP() {
  return this.http.get<any[]>(
    `${this.BASE_URL}/teamlead/sdp/get`,
    { withCredentials: true }
  );
}

markTlSDPDate(id: number, date: string) {
  return this.http.post(
    `${this.BASE_URL}/teamlead/sdp/mark-date`,
    { id, date },
    { withCredentials: true }
  );
}



/* ---------- FDP ---------- */

getTlFDP() {
  return this.http.get<any[]>(
    `${this.BASE_URL}/teamlead/fdp/get`,
    { withCredentials: true }
  );
}

markTlFDPDate(id: number, date: string) {
  return this.http.post(
    `${this.BASE_URL}/teamlead/fdp/mark-date`,
    { id, date },
    { withCredentials: true }
  );
}



/* ---------- INDUSTRY ---------- */

getTlIndustry() {
  return this.http.get<any[]>(
    `${this.BASE_URL}/teamlead/industry/get`,
    { withCredentials: true }
  );
}

markTlIndustryDate(id: number, date: string) {
  return this.http.post(
    `${this.BASE_URL}/teamlead/industry/mark-date`,
    { id, date },
    { withCredentials: true }
  );
}

/* ================= TEAM LEAD HOLIDAYS ================= */

getTlHolidays(year?: number, month?: number) {

  let url = `${this.BASE_URL}/teamlead/holidays/get`;

  if (year && month) {
    const m = String(month).padStart(2, '0');
    url += `?year=${year}&month=${m}`;
  }

  console.log('📡 TL Holidays API →', url);

  return this.http.get<any[]>(url, {
    withCredentials: true
  });
}

/* ================= IV (INDUSTRIAL VISIT) ================= */

/* ---------- BULK UPLOAD ---------- */

bulkUploadIV(data: any) {
  return this.http.post(
    `${this.BASE_URL}/iv/bulk-generate`,
    data,
    { withCredentials: true }
  );
}


/* ---------- LIST VISITS (FINANCE) ---------- */

getIVVisits() {
  return this.http.get<any[]>(
    `${this.BASE_URL}/iv/visits`,
    { withCredentials: true }
  );
}

updateIVPayment(id: number, data: any) {
  return this.http.put(
    `${this.BASE_URL}/iv/visit/payment/${id}`,
    data,
    { withCredentials: true }
  );
}

/* ---------- LIST VISITS (SUB ADMIN) ---------- */

getSubAdminVisits() {
  return this.http.get<any[]>(
    `${this.BASE_URL}/iv/sub-admin/visits`,
    { withCredentials: true }
  );
}
/* ---------- GET STUDENTS BY VISIT ---------- */
getVisitStudents(id: number) {
  return this.http.get<any[]>(
    `${this.BASE_URL}/iv/visit/${id}/students`,
    { withCredentials: true }
  );
}

/* ---------- MARK PAID ---------- */

markIVPaid(id: number) {
  return this.http.put(
    `${this.BASE_URL}/iv/pay/${id}`,
    {},
    { withCredentials: true }
  );
}


/* ---------- DOWNLOAD CERTIFICATE ---------- */

downloadIVCertificate(id: number) {
  return this.http.get(
    `${this.BASE_URL}/iv/generate/${id}`,
    {
      responseType: 'blob',
      withCredentials: true
    }
  );
}

getIVStudentsByCollege(visitId: number) {
  return this.http.get<any[]>(
    `${this.BASE_URL}/iv/visit/${visitId}/students`,
    { withCredentials: true }
  );
}

getIVCertificateSummary() {
  return this.http.get<any>(
    `${this.BASE_URL}/iv/certificate-summary`,
    { withCredentials: true }
  );
}

bulkDownloadIVCertificates(visitId: number) {
  return this.http.get(
    `${this.BASE_URL}/iv/bulk-download/${visitId}`,
    {
      responseType: 'blob',
      withCredentials: true
    }
  );
}

verifyId(token: string, idValue: string) {
  return this.http.post(
    `${this.BASE_URL}/certificate-access/verify-id`,
    { token, idValue }
  );
}

verifyOtp(token: string, otp: string) {
  return this.http.post(
    `${this.BASE_URL}/certificate-access/verify-otp`,
    { token, otp }
  );
}


/* ================= CERTIFICATE ACCESS ================= */

getCertificateProfile(token: string) {
  return this.http.get(
    `${this.BASE_URL}/certificate-access/profile/${token}`
  );
}

downloadCertificate(token: string) {
  return this.http.get(
    `${this.BASE_URL}/certificate-access/download/${token}`,
    { responseType: 'blob' }
  );
}


}
