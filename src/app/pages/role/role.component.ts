import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role.component.html'
})
export class RoleComponent {

  roleName: string = '';
  roles: string[] = [];

  addRole(): void {
    if (!this.roleName.trim()) {
      return;
    }
    this.roles.push(this.roleName.trim());
    this.roleName = '';
  }

  deleteRole(index: number): void {
    this.roles.splice(index, 1);
  }
}
