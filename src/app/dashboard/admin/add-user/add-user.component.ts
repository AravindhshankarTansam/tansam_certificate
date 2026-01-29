import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {

  users: any[] = [];
  roles: any[] = [];
  labs: any[] = [];

  showModal = false;
  editing: any = null;

  showPassword = false;
  isTeamLead = false;

  form: any = {
    name: '',
    email: '',
    mobile: '',
    password: '',
    role_id: null,
    lab_id: null,
    is_active: true
  };

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
    this.loadLabs();
  }

  /** Load all users */
  loadUsers() {
    this.api.getUsers().subscribe({
      next: res => {
        this.users = res;
        console.log('Users loaded:', res);
      },
      error: err => console.error('Error loading users:', err)
    });
  }

  /** Load roles dropdown */
  loadRoles() {
    this.api.getRoleDropdown().subscribe({
      next: res => {
        this.roles = res;
        console.log('Roles loaded:', res);
      },
      error: err => console.error('Error loading roles:', err)
    });
  }

  /** Load labs dropdown */
  loadLabs() {
    this.api.getLabsDropdown().subscribe({
      next: res => {
        this.labs = res;
        console.log('Labs loaded:', res);
      },
      error: err => console.error('Error loading labs:', err)
    });
  }

  /** Open modal for Add/Edit user */
  openModal(user?: any) {
    this.showModal = true;
    this.editing = user || null;

    this.form = user
      ? { ...user, password: '' } // reset password on edit
      : {
          name: '',
          email: '',
          mobile: '',
          password: '',
          role_id: null,
          lab_id: null,
          is_active: true
        };

    this.onRoleChange();
  }

  /** Close modal */
  close() {
    this.showModal = false;
    this.loadUsers();
  }

  /** Handle role change */
  onRoleChange() {
    // Find selected role object by role_id
    const selectedRole = this.roles.find(r => r.id === +this.form.role_id);
    this.isTeamLead = selectedRole?.name?.trim().toLowerCase() === 'team lead';

    if (!this.isTeamLead) {
      this.form.lab_id = null;
    }
  }

  /** Save user (Add or Update) */
  save() {
    console.log('Save clicked', this.form);

    // Basic validation
    if (!this.form.name || !this.form.email || !this.form.mobile || !this.form.role_id) {
      this.toast.show('Fill all fields', 'error');
      return;
    }

    if (this.isTeamLead && !this.form.lab_id) {
      this.toast.show('Please select Lab', 'error');
      return;
    }

    if (this.editing) {
      console.log('Updating user id:', this.editing.id);
      this.api.updateUser(this.editing.id, this.form).subscribe({
        next: () => {
          this.toast.show('User updated successfully', 'success');
          this.close();
        },
        error: err => {
          console.error('Update failed:', err);
          this.toast.show('Update failed', 'error');
        }
      });
    } else {
      console.log('Adding new user');
      this.api.addUser(this.form).subscribe({
        next: () => {
          this.toast.show('User added successfully', 'success');
          this.close();
        },
        error: err => {
          console.error('Add user failed:', err);
          this.toast.show('Add user failed', 'error');
        }
      });
    }
  }
}
