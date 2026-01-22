import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user = {
    name: 'Neha',
    role: 'TEAM_LEAD' // change to 'EMPLOYEE' to test
  };

  getRole() {
    return this.user.role;
  }
}
