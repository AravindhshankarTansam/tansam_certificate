import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../../../services/api.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-add-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-leads.component.html',
  styleUrl: './add-leads.component.css'
})
export class AddLeadsComponent implements OnInit {

  leads: any[] = [];
  labs: any[] = [];

  showModal = false;
  editingLead: any = null;

  dropdownOpen = false;

  errors = { email: '', phone: '' };

  lead = {
    name: '',
    email: '',
    phone: '',
    lab_id: '',
    is_active: true
  };

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadLeads();
    this.loadLabs();
  }

  /* ================= LOAD DATA ================= */

  loadLeads() {
    this.api.getTeamLeads().subscribe({
      next: (res) => this.leads = res
    });
  }

  loadLabs() {
    this.api.getLabsDropdown().subscribe({
      next: (res) => this.labs = res
    });
  }

  /* ================= MODAL ================= */

  openModal() {
    this.showModal = true;
    this.editingLead = null;

    this.lead = {
      name: '',
      email: '',
      phone: '',
      lab_id: '',
      is_active: true
    };
  }

  closeModal() {
    this.showModal = false;
  }

  /* ================= SAVE ================= */

  saveLead() {

    this.errors = { email: '', phone: '' };

    if (!this.lead.name || !this.lead.email || !this.lead.phone || !this.lead.lab_id) {
      this.toast.show('Please fill all fields', 'error');
      return;
    }

    /* EMAIL VALIDATION */
    if (!this.validateEmail(this.lead.email)) {
      this.errors.email = 'Enter valid email address';
      return;
    }

    /* PHONE VALIDATION */
    if (!this.validatePhone(this.lead.phone)) {
      this.errors.phone = 'Phone must be 10 digits';
      return;
    }


    /* ===== SAVE ===== */
    if (this.editingLead) {

      this.api.updateTeamLead(this.editingLead.id, this.lead)
        .subscribe(() => {
          this.toast.show('Updated successfully', 'success');
          this.closeModal();
          this.loadLeads();
        });

    } else {

      this.api.addTeamLead(this.lead)
        .subscribe(() => {
          this.toast.show('Lead added successfully', 'success');
          this.closeModal();
          this.loadLeads();
        });
    }
  }


  /* ================= EDIT ================= */

  editLead(lead: any) {
    this.editingLead = lead;
    this.showModal = true;

    this.lead = { ...lead };
  }

  /* ================= DELETE ================= */

  deleteLead(id: number) {

    if (!confirm('Delete this lead?')) return;

    this.api.deleteTeamLead(id).subscribe(() => {
      this.toast.show('Deleted successfully', 'info');
      this.loadLeads();
    });
  }

  /* ================= Error and validation ================= */
  validateEmail(email: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }

  validatePhone(phone: string): boolean {
    const pattern = /^[0-9]{10}$/; // 10 digits only
    return pattern.test(phone);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectLab(lab: any, event: Event) {
    event.stopPropagation();
    this.lead.lab_id = lab.id;
    this.dropdownOpen = false;
  }

  getSelectedLabName() {
    const lab = this.labs.find(l => l.id == this.lead.lab_id);
    return lab ? lab.name : '';
  }


}
