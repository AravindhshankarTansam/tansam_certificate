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

}
