import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent implements OnInit {

  roles: any[] = [];
  showModal = false;
  editing: any = null;

  roleName = '';

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getRoles().subscribe(res => this.roles = res);
  }

  openModal(role?: any) {
    this.showModal = true;
    this.editing = role || null;
    this.roleName = role ? role.name : '';
  }

  save() {

    if (!this.roleName.trim()) {
      this.toast.show('Role name required', 'error');
      return;
    }

    if (this.editing) {
      this.api.updateRole(this.editing.id, this.roleName)
        .subscribe(() => {
          this.toast.show('Updated successfully', 'success');
          this.close();
        });
    } else {
      this.api.addRole(this.roleName)
        .subscribe(() => {
          this.toast.show('Added successfully', 'success');
          this.close();
        });
    }
  }

  delete(id: number) {
    if (!confirm('Delete role?')) return;

    this.api.deleteRole(id).subscribe(() => {
      this.toast.show('Deleted', 'info');
      this.load();
    });
  }

  close() {
    this.showModal = false;
    this.load();
  }
}
