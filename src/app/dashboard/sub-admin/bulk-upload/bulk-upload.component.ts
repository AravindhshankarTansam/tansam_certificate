import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.css']
})
export class BulkUploadComponent {

  collegeName = '';
 /* ===== Upload popup ===== */
  showUploadPopup = false;

  /* ===== Preview modal ===== */
  showPreviewModal = false;

  selectedFile: File | null = null;
  fileName = '';
  category = '';

  uploadedData: any[] = [];
  tableHeaders: string[] = [];

  /* ================= POPUP ================= */

  openPopup() {
    this.showUploadPopup = true;
  }

  closePopup() {
    this.showUploadPopup = false;
    this.selectedFile = null;
    this.fileName = '';
  }

  /* ================= FILE ================= */

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      alert('Upload CSV or Excel only');
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;
  }

  uploadFile() {
    if (!this.selectedFile) return;

    const ext = this.selectedFile.name.split('.').pop()?.toLowerCase();
    ext === 'csv'
      ? this.readCSV(this.selectedFile)
      : this.readExcel(this.selectedFile);
  }

  /* ================= CSV ================= */

  private readCSV(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      const rows = (reader.result as string)
        .split('\n')
        .map(r => r.trim())
        .filter(Boolean);

      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
      this.detectCategory(headers);
      if (!this.category) return;

      const data = rows.slice(1).map(row => {
        const values = row.split(',');
        const obj: any = {};
        headers.forEach((h, i) => obj[h] = values[i]?.trim());
        return obj;
      });

      this.success(data);
    };

    reader.readAsText(file);
  }

  /* ================= EXCEL ================= */

  private readExcel(file: File) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

      const headers = Object.keys(data[0]).map(h => h.toLowerCase());
      this.detectCategory(headers);
      if (!this.category) return;

      this.success(data);
    };

    reader.readAsBinaryString(file);
  }

  /* ================= CATEGORY ================= */

  private detectCategory(headers: string[]) {
    if (headers.includes('regno')) this.category = 'Academic SDP';
    else if (headers.includes('faculty no')) this.category = 'Academic FDP';
    else if (headers.includes('employee id')) this.category = 'Industry';
    else {
      alert('Unable to detect category');
      this.category = '';
    }
  }

  /* ================= SUCCESS ================= */

  private success(data: any[]) {
    this.uploadedData = data;
    this.tableHeaders = Object.keys(data[0]);

    this.showUploadPopup = false;
    this.showPreviewModal = true; // 👈 KEY LINE
  }

  closePreview() {
    this.showPreviewModal = false;
  }
}