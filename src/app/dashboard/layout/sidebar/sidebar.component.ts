import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';


import { ROLE_MENUS, MenuItem } from './sidebar.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  menuItems: MenuItem[] = [];
  constructor(private router: Router) {}


  ngOnInit(): void {
    // 🔹 get role (change this later to AuthService if needed)
    const role = localStorage.getItem('role') || 'ADMIN';

    this.menuItems = ROLE_MENUS[role] || [];
  }
  
  
  // 🔹 toggle dropdown open/close
  toggle(item: any) {
    item.open = !item.open;
  }
  logout() {
  // clear everything
  localStorage.clear();
  sessionStorage.clear();

  // navigate to login
  this.router.navigate(['/login']);
}

}
