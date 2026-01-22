import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  template: `
    <div style="text-align:center; margin-top:80px">
      <h1>🚫 Access Denied</h1>
      <p>You are not authorized to view this page.</p>
      <a routerLink="/dashboard">Go Back</a>
    </div>
  `
})
export class UnauthorizedComponent {}
