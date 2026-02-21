import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-sdp-bulk-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sdpbulkupload.component.html',
  styleUrls: ['./sdpbulkupload.component.css']
})
export class SdpBulkUploadComponent implements OnInit {

  collegeName: string = '';
  collegeShortName: string = '';
  labs: any[] = [];
  selectedLab: string = '';

  fromDate = '';
  toDate = '';

  selectedFile: File | null = null;
  fileName: string = '';
  isDragActive: boolean = false;

  uploadedData: any[] = [];

  batches: any[] = [];
  selectedBatch: any = null;
  showBatchDetails = false;

  requiredHeaders = [
    'student_name',
    'register_no',
    'department',
    'phone',
    'email'
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadBatches();
    this.loadLabs();
  }

  loadLabs() {
  this.api.getLabs().subscribe({
    next: (res) => {
      this.labs = res;
    },
    error: (err) => {
      console.error('Failed to load labs', err);
    }
  });
}


  /* ================= LOAD BATCHES ================= */

  loadBatches() {
    this.api.getBulkSdpBatches().subscribe({
      next: (res) => this.batches = res,
      error: (err) => console.error('Failed to load batches', err)
    });
  }

  /* ================= FILE SELECT ================= */

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    this.fileName = file.name;
  }

  /* ================= EXCEL PARSE ================= */

  uploadFile() {

    if (!this.selectedLab) {
      alert('Please select Programme');
      return;
    }

    if (!this.selectedFile) {
      alert('Please select Excel file');
      return;
    }

    if (!this.collegeName || !this.fromDate || !this.toDate) {
      alert('Fill college and date details');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: any) => {

      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' });

      if (!data.length) {
        alert('Excel sheet is empty');
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

      this.uploadedData = data.map(row => ({
        ...row,
        college_name: this.collegeName,
        college_short_name: this.collegeShortName,
        from_date: this.fromDate,
        to_date: this.toDate
      }));
    };

    reader.readAsBinaryString(this.selectedFile);
  }

  /* ================= CONFIRM UPLOAD ================= */

  confirmUpload() {

    if (!this.selectedFile || !this.uploadedData.length) {
      alert('Upload and preview Excel first');
      return;
    }

    const formData = new FormData();

    formData.append('file', this.selectedFile);
    formData.append('collegeName', this.collegeName);
    formData.append('collegeShortName', this.collegeShortName);
    formData.append('labId', this.selectedLab);
    formData.append('fromDate', this.fromDate);
    formData.append('toDate', this.toDate);
    formData.append('students', JSON.stringify(this.uploadedData));

    this.api.bulkUploadSDP(formData).subscribe({
      next: () => {
        alert('Bulk upload successful');

        this.resetForm();
        this.loadBatches();
      },
      error: (err) => {
        console.error(err);
        alert('Upload failed');
      }
    });
  }

  /* ================= RESET ================= */

  resetForm() {
    this.uploadedData = [];
    this.selectedFile = null;
    this.fileName = '';

    this.collegeName = '';
    this.collegeShortName = '';
    this.fromDate = '';
    this.toDate = '';
  }

  /* ================= VIEW BATCH ================= */

  viewBatch(batch: any) {

    this.api.getBulkSdpStudents(batch.id).subscribe({
      next: (students) => {
        this.selectedBatch = { ...batch, students };
        this.showBatchDetails = true;
      },
      error: (err) => console.error('Failed to load students', err)
    });
  }

  closeBatchDetails() {
    this.showBatchDetails = false;
    this.selectedBatch = null;
  }

  /* ================= TEMPLATE ================= */

  downloadTemplate() {

    const headers = [
      'student_name',
      'register_no',
      'department',
      'phone',
      'email'
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'SDP Template');
    XLSX.writeFile(wb, 'SDP_Bulk_Template.xlsx');
  }

  //  ========== DOWNLOAD BATCH DATA ==========  //

  downloadBatch(batch: any) {

  if (!batch.generated_count || batch.generated_count === 0) {
    alert('Certificates not generated yet');
    return;
  }

  this.api.bulkDownloadSdpCertificates(batch.id).subscribe({
    next: (blob: Blob) => {

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${batch.college_short_name}_SDP_CERTIFICATES.zip`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error(err);
      alert('Download failed');
    }
  });
}

downloadCertificate(student: any) {

  if (!student.certificate_generated) {
    alert('Certificate not generated');
    return;
  }

  this.api.downloadSingleSdpCertificate(student.id).subscribe({
    next: (blob: Blob) => {

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;

      // use DB certificate number for filename
      const safeFileName =
        student.certificate_no.replace(/[\/\\?%*:|"<>]/g, '-');

      a.download = `${safeFileName}.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error(err);
      alert('Download failed');
    }
  });
}
}
