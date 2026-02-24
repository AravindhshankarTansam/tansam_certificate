import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-industry-bulk-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './industrybulkupload.component.html',
  styleUrls: ['./industrybulkupload.component.css']
})
export class IndustryBulkUploadComponent implements OnInit {

  companyName = '';
  companyShortName = '';
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

  /* ✅ Industry Excel headers */
  requiredHeaders = [
    'sl_no',
    'employee_name',
    'employee_id_no',
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
      next: res => this.labs = res
    });
  }

  /* ================= LOAD BATCHES ================= */
  loadBatches() {
    this.api.getBulkIndustryBatches().subscribe({
      next: res => this.batches = res
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

      /* ✅ Map Excel */
      this.uploadedData = data.map(row => ({
        employee_name: row.employee_name,
        employee_id_no: row.employee_id_no,
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
    formData.append('companyName', this.companyName);
    formData.append('companyShortName', this.companyShortName);
    formData.append('labId', this.selectedLab);
    formData.append('fromDate', this.fromDate);
    formData.append('toDate', this.toDate);
    formData.append('employees', JSON.stringify(this.uploadedData));

    this.api.bulkUploadIndustry(formData).subscribe({
      next: () => {
        alert('Industry upload success');
        this.reset();
        this.loadBatches();
      },
      error: () => alert('Upload failed')
    });
  }

  reset() {
    this.uploadedData = [];
    this.selectedFile = null;
    this.fileName = '';
  }

  /* ================= VIEW ================= */
  viewBatch(batch: any) {
    this.api.getBulkIndustryEmployees(batch.id).subscribe({
      next: employees => {
        this.selectedBatch = { ...batch, employees };
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
      'employee_name',
      'employee_id_no',
      'department',
      'phone',
      'email'
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Industry Template');
    XLSX.writeFile(wb, 'Industry_Bulk_Template.xlsx');
  }

  /* ================= DOWNLOAD ================= */
  downloadBatch(batch: any) {

    if (!batch.generated_count) {
      alert('Certificates not ready');
      return;
    }

    this.api.bulkDownloadIndustryCertificates(batch.id)
      .subscribe(blob => {

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${batch.company_short_name}_IND_CERTIFICATES.zip`;

        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  downloadCertificate(emp: any) {

    if (!emp.certificate_generated) {
      alert('Not generated');
      return;
    }

    this.api.downloadSingleIndustryCertificate(emp.id)
      .subscribe(blob => {

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;

        const safeFile =
          emp.certificate_no.replace(/[\/\\?%*:|"<>]/g, '-');

        a.download = `${safeFile}.pdf`;

        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

}
