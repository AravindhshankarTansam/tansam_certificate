import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-fdp-bulk-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fdpbulkupload.component.html',
  styleUrls: ['./fdpbulkupload.component.css']
})
export class FdpBulkUploadComponent implements OnInit {

  collegeName = '';
  collegeShortName = '';
  labs: any[] = [];
  selectedLab = '';

  fromDate = '';
  toDate = '';

  selectedFile: File | null = null;
  fileName = '';

  uploadedData: any[] = [];

  batches: any[] = [];
  selectedBatch: any = null;
  showBatchDetails = false;

  /* ✅ CHANGED HEADERS */
requiredHeaders = [
  'sl_no',
  'staff_name',
  'staff_id',
  'department',
  'phone',
  'email'
];
  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadLabs();
    this.loadBatches();
  }

  /* ================= LOAD LABS ================= */
  loadLabs() {
    this.api.getLabs().subscribe({
      next: res => this.labs = res,
      error: err => console.error(err)
    });
  }

  /* ================= LOAD BATCHES ================= */
  loadBatches() {
    this.api.getBulkFdpBatches().subscribe({
      next: res => this.batches = res,
      error: err => console.error(err)
    });
  }

  /* ================= FILE ================= */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    this.fileName = file.name;
  }

  /* ================= EXCEL ================= */
  uploadFile() {

    if (!this.selectedLab) {
      alert('Select Programme');
      return;
    }

    if (!this.selectedFile) {
      alert('Select Excel file');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: any) => {

      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' });

      if (!data.length) {
        alert('Excel empty');
        return;
      }

      const headers = Object.keys(data[0]);

      const missing = this.requiredHeaders.filter(
        h => !headers.includes(h)
      );

      if (missing.length) {
        alert('Missing columns: ' + missing.join(', '));
        return;
      }

      /* ✅ Map Excel to backend fields */
this.uploadedData = data.map(row => ({
  staff_name: row.staff_name,
  staff_id: row.staff_id,
  department: row.department,
  phone: row.phone,
  email: row.email,
  from_date: this.fromDate,
  to_date: this.toDate
}));
    };

    reader.readAsBinaryString(this.selectedFile);
  }

  /* ================= CONFIRM ================= */
  confirmUpload() {

    if (!this.uploadedData.length) {
      alert('Upload Excel first');
      return;
    }

    const formData = new FormData();

    formData.append('file', this.selectedFile!);
    formData.append('collegeName', this.collegeName);
    formData.append('collegeShortName', this.collegeShortName);
    formData.append('labId', this.selectedLab);
    formData.append('fromDate', this.fromDate);
    formData.append('toDate', this.toDate);
    formData.append('students', JSON.stringify(this.uploadedData));

    this.api.bulkUploadFDP(formData).subscribe({
      next: () => {
        alert('FDP upload success');
        this.reset();
        this.loadBatches();
      },
      error: () => alert('Upload failed')
    });
  }

  /* ================= RESET ================= */
  reset() {
    this.uploadedData = [];
    this.selectedFile = null;
    this.fileName = '';
  }

  /* ================= VIEW ================= */
  viewBatch(batch: any) {
    this.api.getBulkFdpStudents(batch.id).subscribe({
      next: students => {
        this.selectedBatch = { ...batch, students };
        this.showBatchDetails = true;
      }
    });
  }

  closeBatchDetails() {
    this.showBatchDetails = false;
  }

  /* ================= TEMPLATE ================= */
downloadTemplate() {

  const headers = [
    'sl_no',
    'staff_name',
    'staff_id',
    'department',
    'phone',
    'email'
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers]);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, 'FDP Template');
  XLSX.writeFile(wb, 'FDP_Bulk_Template.xlsx');
}

  /* ================= DOWNLOAD ================= */
  downloadBatch(batch: any) {

    if (!batch.generated_count) {
      alert('Certificates not ready');
      return;
    }

    this.api.bulkDownloadFdpCertificates(batch.id).subscribe({
      next: blob => {

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${batch.college_short_name}_FDP_CERTIFICATES.zip`;

        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  downloadCertificate(staff: any) {

    if (!staff.certificate_generated) {
      alert('Not generated');
      return;
    }

    this.api.downloadSingleFdpCertificate(staff.id).subscribe({
      next: blob => {

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;

        const safeFile =
          staff.certificate_no.replace(/[\/\\?%*:|"<>]/g, '-');

        a.download = `${safeFile}.pdf`;

        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }
}
