import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../../../services/api.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-sdp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sdp.component.html',
  styleUrl: './sdp.component.css'
})
export class SdpComponent implements OnInit {

  students: any[] = [];
  labs: any[] = [];
  showModal = false;
  editingId: number | null = null;

  form: any = this.getEmptyForm();

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadLabs();
    this.loadStudents();
  }

  /* ================= LOAD ================= */

  loadLabs() {
    this.api.getLabs().subscribe(res => this.labs = res);
  }

  loadStudents() {
    this.api.getSDP().subscribe(res => this.students = res);
  }

  /* ================= FORM ================= */

  getEmptyForm() {
    return {
      student_name: '',
      register_no: '',
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

  /* ================= EDIT ================= */

  edit(row: any) {
    this.form = { ...row };
    this.editingId = row.id;
  }

  /* open modal */
openModal(row: any = null) {

  this.showModal = true;

  if (row) {
    this.form = { ...row };
    this.editingId = row.id;
  } else {
    this.reset();
  }
}

/* close modal */
closeModal() {
  this.showModal = false;
}

/* modify save() */
save() {

  if (!this.form.student_name) {
    this.toast.show('Student name required', 'error');
    return;
  }

  const req = this.editingId
    ? this.api.updateSDP(this.editingId, this.form)
    : this.api.addSDP(this.form);

  req.subscribe(() => {
    this.toast.show(
      this.editingId ? 'Updated successfully' : 'Added successfully',
      'success'
    );

    this.closeModal();
    this.reset();
    this.loadStudents();
  });
}
}
