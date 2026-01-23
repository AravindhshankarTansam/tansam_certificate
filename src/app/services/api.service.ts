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

}
