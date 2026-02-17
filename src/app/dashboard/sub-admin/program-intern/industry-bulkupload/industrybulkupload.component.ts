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
  fromDate = '';
  toDate = '';

  /* ================= FILE ================= */
  selectedFile: File | null = null;
  fileName = '';
  isDragActive = false;

  /* ================= PREVIEW ================= */
  uploadedData: any[] = [];
  tableHeaders: string[] = [];

  /* ================= FINAL STORAGE ================= */
  batches: any[] = [];
  selectedBatch: any = null;
  showBatchDetails = false;

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

  /* ================= TEMPLATE ================= */

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

      const enrichedData = data.map(row => ({
        ...row,
        industry_name: this.industryName,
        industry_short_code: this.industryShortCode,
        from_date: this.fromDate,
        to_date: this.toDate
      }));

      this.uploadedData = enrichedData;
    };

    reader.readAsBinaryString(this.selectedFile);
  }

  /* ================= CONFIRM ================= */

  confirmUpload() {

    const batch = {
      industry_name: this.industryName,
      industry_short_code: this.industryShortCode,
      from_date: this.fromDate,
      to_date: this.toDate,
      total_participants: this.uploadedData.length,
      participants: [...this.uploadedData]
    };

    this.batches.push(batch);

    this.uploadedData = [];
    this.selectedFile = null;
    this.fileName = '';
  }

  /* ================= VIEW ================= */

  viewBatch(batch: any) {
    this.selectedBatch = batch;
    this.showBatchDetails = true;
  }

  closeBatchDetails() {
    this.showBatchDetails = false;
    this.selectedBatch = null;
  }

}
