import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private BASE_URL = 'http://localhost:5055/api';

  constructor(private http: HttpClient) {}


  /* ========================
     AUTH
  ======================== */

  login(data: any) {
    return this.http.post(
      `${this.BASE_URL}/auth/login`,
      data,
      { withCredentials: true }
    );
  }


  /* ========================
     LABS (YOUR CUSTOM PATHS)
  ======================== */

getLabs() {
  return this.http.get<any[]>(
    `${this.BASE_URL}/admin/master-table/labs/get`,
    { withCredentials: true }
  );
}

addLab(name: string) {
  return this.http.post(
    `${this.BASE_URL}/admin/master-table/labs/post`,
    { name },
    { withCredentials: true }
  );
}

updateLab(id: number, name: string) {
  return this.http.put(
    `${this.BASE_URL}/admin/master-table/labs/update/${id}`,
    { name },
    { withCredentials: true }
  );
}


}
