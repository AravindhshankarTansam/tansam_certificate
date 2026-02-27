import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core'
import { ApiService } from '../../../services/api.service';


import * as XLSX from 'xlsx';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.css']
})
export class BulkUploadComponent implements OnInit{
visibleHeaders: any;

  constructor(private api: ApiService) {}
  visits: any[] = [];
  showStudentsModal = false;
  selectedVisit: any = null;
  students: any[] = [];

  /* ================= BASIC INFO ================= */

  collegeName = '';
  visitDate = '';
  collegeShortName = '';


  /* ================= MODALS ================= */

  showUploadPopup = false;
  showPreviewModal = false;

  /* ================= FILE ================= */

  selectedFile: File | null = null;
  fileName = '';

  /* ================= DATA ================= */

  uploadedData: any[] = [];
  tableHeaders: string[] = [];
  category = '';

  /* ================= REQUIRED HEADERS ================= */

  requiredHeaders = [
    'sl.no',
    'name',
    'register number',
    'email id',
    'phone number',
    'department'
  ];

  isDragActive = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragActive = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragActive = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragActive = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['csv', 'xlsx', 'xls'].includes(ext || '')) {
        this.selectedFile = file;
        this.fileName = file.name;
      } else {
        alert('Please upload CSV or Excel file only');
      }
    }
  }
  /* =====================================================
     POPUP
  ===================================================== */

  openPopup() {
    if (!this.collegeName || !this.visitDate) {
      alert('Enter college name and visit date');
      return;
    }

    this.showUploadPopup = true;
  }

  closePopup() {
    this.showUploadPopup = false;
    this.selectedFile = null;
    this.fileName = '';
  }

  /* =====================================================
     FILE SELECT
  ===================================================== */

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

  /* =====================================================
     CSV READER
  ===================================================== */

  private readCSV(file: File) {

    const reader = new FileReader();

    reader.onload = () => {

      const rows = (reader.result as string)
        .split('\n')
        .map(r => r.trim())
        .filter(Boolean);

      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());

      if (!this.validateHeaders(headers)) return;

      const data = rows.slice(1).map((row, index) => {

        const values = row.split(',');

        const obj: any = {};

        headers.forEach((h, i) => {
          obj[h] = values[i]?.trim();
        });

        obj['sl.no'] = index + 1;

        return obj;
      });

      this.success(data);
    };

    reader.readAsText(file);
  }

  /* =====================================================
     EXCEL READER
  ===================================================== */

  private readExcel(file: File) {

    const reader = new FileReader();

    reader.onload = (e: any) => {

      const workbook = XLSX.read(e.target.result, { type: 'binary' });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

      if (!data.length) {
        alert('Empty sheet');
        return;
      }

      const headers = Object.keys(data[0]).map(h => h.toLowerCase());

      if (!this.validateHeaders(headers)) return;

      data.forEach((d, i) => d['sl.no'] = i + 1);

      this.success(data);
    };

    reader.readAsBinaryString(file);
  }

  /* =====================================================
     HEADER VALIDATION
  ===================================================== */

  private validateHeaders(headers: string[]) {

    const normalized = headers.map(h => h.toLowerCase());

    const missing = this.requiredHeaders.filter(h => !normalized.includes(h));

    if (missing.length) {
      alert('Missing columns: ' + missing.join(', '));
      return false;
    }

    this.category = 'IV Certificate';

    return true;
  }

  /* =====================================================
     SUCCESS
  ===================================================== */

  private success(data: any[]) {

    this.uploadedData = data;
    this.tableHeaders = Object.keys(data[0]);

    this.showUploadPopup = false;
    this.showPreviewModal = true;
  }

  closePreview() {
    this.showPreviewModal = false;
  }

  /* =====================================================
     CONFIRM UPLOAD → SEND TO BACKEND
  ===================================================== */

confirmUpload() {
  const formData = new FormData();
  formData.append('file', this.selectedFile!);
  formData.append('collegeName', this.collegeName);
  formData.append('collegeShortName', this.collegeShortName);
  formData.append('visitDate', this.visitDate);
  formData.append('students', JSON.stringify(this.uploadedData));
  this.api.bulkUploadIV(formData)
    .subscribe({
      next: () => {
        alert('File + data uploaded');
        this.closePreview();
        this.loadVisits();
      }
    });
}


  /* =====================================================
     TEMPLATE DOWNLOAD
  ===================================================== */

  downloadTemplate() {

    const headers = this.requiredHeaders;

    const ws = XLSX.utils.aoa_to_sheet([headers]);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    XLSX.writeFile(wb, 'IV_Template.xlsx');
  }

loadVisits() {
  console.log('🚀 Calling Sub Admin Visits API...');

  this.api.getSubAdminVisits().subscribe({
    next: (res: any) => {
      console.log('✅ Visits API Success:', res);

      this.visits = res;

      console.log('📦 visits assigned:', this.visits);
      console.log('📊 total visits:', this.visits?.length);
    },

    error: (err) => {
      console.error('❌ Visits API Error:', err);
    },

    complete: () => {
      console.log('🏁 Visits API completed');
    }
  });
}

ngOnInit() {
  this.loadVisits();
}

openStudents(visit: any) {
  this.selectedVisit = visit;
  this.showStudentsModal = true;

  console.log('👁️ Opening visit:', visit);

  this.api.getVisitStudents(visit.id).subscribe({
    next: (res: any) => {
      console.log('✅ Students:', res);
      this.students = res;
    },
    error: (err) => console.error(err)
  });
}

closeStudents() {
  this.showStudentsModal = false;
  this.students = [];
}

}
