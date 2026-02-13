import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-industry-bulk-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './industrybulkupload.component.html',
  styleUrls: ['./industrybulkupload.component.css']
})
export class IndustryBulkUploadComponent {

  /* ================= BASIC INFO ================= */
  industryName = '';
  industryShortCode = '';
 visitDate: string = '';

  /* ================= FILE ================= */
  selectedFile: File | null = null;
  fileName = '';
  isDragActive = false;

  /* ================= PREVIEW ================= */
  showPreviewModal = false;
  uploadedData: any[] = [];
  tableHeaders: string[] = [];

  /* Required headers for Industry */
  requiredHeaders = [
    'participant_name',
    'designation',
    'department',
    'phone',
    'email'
  ];

  /* ================= FILE HANDLING ================= */

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    this.fileName = file.name;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragActive = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragActive = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragActive = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileName = file.name;
    }
  }

  /* ================= TEMPLATE DOWNLOAD ================= */

  downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([this.requiredHeaders]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Industry Template');
    XLSX.writeFile(wb, 'Industry_Bulk_Template.xlsx');
  }

  /* ================= UPLOAD ================= */

  uploadFile() {
    if (!this.selectedFile) return;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' });

      if (!data.length) {
        alert('Empty sheet');
        return;
      }

      const headers = Object.keys(data[0]);

      const missing = this.requiredHeaders.filter(h => !headers.includes(h));

      if (missing.length) {
        alert('Missing columns: ' + missing.join(', '));
        return;
      }

      this.uploadedData = data;
      this.tableHeaders = headers;
      this.showPreviewModal = true;
    };

    reader.readAsBinaryString(this.selectedFile);
  }

  /* ================= CONFIRM UPLOAD ================= */

  confirmUpload() {
    console.log('Industry Bulk Data:', this.uploadedData);

    // Backend not connected yet
    alert('Backend not connected yet');

    this.showPreviewModal = false;
  }

  closePreview() {
    this.showPreviewModal = false;
  }

}
