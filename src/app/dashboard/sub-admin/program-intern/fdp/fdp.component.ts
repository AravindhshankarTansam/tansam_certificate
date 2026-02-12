import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,NgForm } from '@angular/forms';

import { ApiService } from '../../../../services/api.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-fdp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fdp.component.html',
  styleUrls: ['./fdp.component.css']
})
export class FdpComponent implements OnInit {

  staffs: any[] = [];
  labs: any[] = [];

  showModal = false;
  editingId: number | null = null;
  showValidationError = false;
  toastMessage: string = '';
  toastType: 'success' | 'info' | 'error' = 'success';


  form: any = this.getEmptyForm();

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadLabs();
    this.loadStaffs();
  }

  /* ================= LOAD ================= */

  loadLabs() {
    this.api.getLabs().subscribe(res => this.labs = res);
  }

  loadStaffs() {
    this.api.getFDP().subscribe(res => this.staffs = res);
  }

  /* ================= FORM ================= */

  getEmptyForm() {
    return {
      staff_name: '',
      staff_id_no: '',  // ✅ changed
      college_name: '',
      department: '',
      phone: '',
      email: '',
      lab_id: '',
      from_date: '',
      to_date: ''
    };
  }

  reset() {
    this.form = this.getEmptyForm();
    this.editingId = null;
  }

  openModal(row: any = null) {
    this.showModal = true;

    if (row) {
      this.form = { ...row };
      this.editingId = row.id;
    } else {
      this.reset();
    }
  }

  closeModal() {
    this.showModal = false;
  }

save(fdpForm: NgForm) {
  this.showValidationError = false;

  if (fdpForm.invalid) {
    this.showValidationError = true;
    fdpForm.control.markAllAsTouched();
    return;
  }

  const operation = this.editingId
    ? this.api.updateFDP(this.editingId, this.form)
    : this.api.addFDP(this.form);

  operation.subscribe({
    next: () => {
      this.showToast(
        this.editingId
          ? 'FDP staff updated successfully'
          : 'FDP staff created successfully',
        'success'
      );
      this.closeModal();
      this.loadStaffs();
    },
    error: (err) => {
      console.error('Save failed:', err);
      this.showToast('Failed to save. Please try again.', 'error');
    }
  });
}
  private showToast(message: string, type: 'success' | 'info' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;

    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }

}
