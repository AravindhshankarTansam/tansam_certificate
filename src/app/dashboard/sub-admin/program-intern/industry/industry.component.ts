
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-industry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './industry.component.html',
  styleUrls: ['./industry.component.css']
})
export class IndustryComponent implements OnInit {

  list: any[] = [];
  labs: any[] = [];

  showModal = false;
  editingId: number | null = null;

  form: any = this.emptyForm();
  toastMessage: string = '';
  toastType: 'success' | 'info' | 'error' = 'success';
  showValidationError = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
    this.loadLabs();
  }

  emptyForm() {
    return {
      industry_staff_name: '',
      industry_staff_id: '',
      industry_name: '',
      designation_name: '',
      phone: '',
      email: '',
      lab_id: '',
      from_date: '',
      to_date: ''
    };
  }

  load() {
    this.api.getIndustry().subscribe((res: any[]) => this.list = res);
  }

  loadLabs() {
    this.api.getLabs().subscribe(res => this.labs = res);
  }

  openModal(data?: any) {
    this.showModal = true;

    if (data) {
      this.form = { ...data };
      this.editingId = data.id;
    } else {
      this.form = this.emptyForm();
      this.editingId = null;
    }
  }

  closeModal() {
    this.showModal = false;
    this.form = this.emptyForm();
    this.editingId = null;
  }

save() {
    // Client-side required fields check
    if (!this.form.industry_staff_name ||
        !this.form.industry_name ||
        !this.form.phone ||
        !this.form.lab_id) {
      this.showValidationError = true;
      return;
    }

    this.showValidationError = false;

    const operation = this.editingId
      ? this.api.updateIndustry(this.editingId, this.form)
      : this.api.addIndustry(this.form);

    const successMessage = this.editingId
      ? 'Staff updated successfully'
      : 'Staff created successfully';

    const toastType: 'success' | 'info' = this.editingId ? 'info' : 'success';

    operation.subscribe({
      next: () => {
        this.showToast(successMessage, toastType);
        this.closeModal();
        this.load();
      },
      error: (err) => {
        console.error('Save error:', err);

        if (err.status === 403) {
          this.showToast(
            'Please contact admin to update this record',
            'error'           // ← now allowed
          );
        } else {
          this.showToast(
            'Something went wrong. Please try again later.',
            'error'
          );
        }
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