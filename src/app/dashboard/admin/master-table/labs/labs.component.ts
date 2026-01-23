import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
// import { ToastService } from '../../../../shared/toast/toast.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-labs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './labs.component.html',
  styleUrls: ['./labs.component.css']
})
export class LabsComponent implements OnInit {

  showModal = false;

  labName = '';

  labs: any[] = [];

  editingLab: any = null;


  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}


  /* ================= LOAD ON PAGE ================= */
  ngOnInit() {
    this.loadLabs();
  }


  /* ================= FETCH FROM API ================= */
  loadLabs() {
    this.api.getLabs().subscribe({
      next: (res: any) => {
        this.labs = res;
      },
      error: () => {
        this.toast.show('Failed to load labs ', 'error');
      }
    });
  }


  /* ================= OPEN ADD ================= */
  openModal() {
    this.showModal = true;
    this.labName = '';
    this.editingLab = null;
  }


  /* ================= OPEN EDIT ================= */
  editLab(lab: any) {
    this.showModal = true;
    this.labName = lab.name;
    this.editingLab = lab;
  }


  /* ================= CLOSE ================= */
  closeModal() {
    this.showModal = false;
    this.labName = '';
    this.editingLab = null;
  }


  /* ================= SAVE / UPDATE ================= */
  saveLab() {

    if (!this.labName.trim()) {
      this.toast.show('Lab name required', 'info');
      return;
    }

    // UPDATE
    if (this.editingLab) {
      this.api.updateLab(this.editingLab.id, this.labName)
        .subscribe({
          next: () => {
            this.toast.show('Lab updated successfully', 'success');
            this.loadLabs();
          },
          error: () => {
            this.toast.show('Update failed', 'error');
          }
        });
    }

    // ADD
    else {
      this.api.addLab(this.labName)
        .subscribe({
          next: () => {
            this.toast.show('Lab added successfully', 'success');
            this.loadLabs();
          },
          error: () => {
            this.toast.show('Add failed', 'error');
          }
        });
    }

    this.closeModal();
  }

}
