import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-labs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './labs.component.html',
  styleUrls: ['./labs.component.css']
})
export class LabsComponent {

  showModal = false;

  labName = '';

  labs: string[] = [];

  editingIndex: number | null = null; // ⭐ track edit


  /* ================= OPEN ADD ================= */
  openModal() {
    this.showModal = true;
    this.editingIndex = null;
    this.labName = '';
  }


  /* ================= OPEN EDIT ================= */
  editLab(index: number) {
    this.showModal = true;
    this.editingIndex = index;
    this.labName = this.labs[index]; // pre-fill input
  }


  /* ================= CLOSE ================= */
  closeModal() {
    this.showModal = false;
    this.labName = '';
    this.editingIndex = null;
  }


  /* ================= SAVE / UPDATE ================= */
  saveLab() {

    if (!this.labName.trim()) return;

    // edit mode
    if (this.editingIndex !== null) {
      this.labs[this.editingIndex] = this.labName.trim();
    }
    // add mode
    else {
      this.labs.push(this.labName.trim());
    }

    this.closeModal();
  }

}
