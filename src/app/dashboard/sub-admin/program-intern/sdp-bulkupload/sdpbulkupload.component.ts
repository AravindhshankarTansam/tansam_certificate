import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-sdp-bulk-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sdpbulkupload.component.html',
  styleUrls: ['./sdpbulkupload.component.css']
})
export class SdpBulkUploadComponent implements OnInit {

  /* ================= FORM FIELDS ================= */

  collegeName: string = '';
  collegeShortName: string = '';
  fromDate = '';
  toDate = '';


  /* ================= FILE STATE ================= */

  selectedFile: File | null = null;
  fileName: string = '';
  isDragActive: boolean = false;

  /* ================= PREVIEW STATE ================= */

  showPreviewModal: boolean = false;
  uploadedData: any[] = [];
  tableHeaders: string[] = [];

  /* ================= REQUIRED HEADERS ================= */

  requiredHeaders = [
    'student_name',
    'register_no',
    'department',
    'phone',
    'email'
  ];

  ngOnInit(): void {}

  /* ================= FILE SELECT ================= */

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    this.fileName = file.name;
  }

  /* ================= DRAG EVENTS ================= */

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
    if (!file) return;

    this.selectedFile = file;
    this.fileName = file.name;
  }

  /* ================= UPLOAD BUTTON ================= */

  uploadFile() {

    if (!this.selectedFile) return;

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

      /* Attach form values to each row */
      const enrichedData = data.map(row => ({
        ...row,
        college_name: this.collegeName,
        college_short_name: this.collegeShortName,
        from_date: this.fromDate,
        to_date: this.toDate
      }));

      this.uploadedData = enrichedData;
      this.tableHeaders = Object.keys(enrichedData[0]);
      this.showPreviewModal = true;
    };

    reader.readAsBinaryString(this.selectedFile);
  }

  /* ================= TEMPLATE DOWNLOAD ================= */

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

  /* ================= CONFIRM ================= */

  confirmUpload() {

    console.log('Final SDP Bulk Data:', this.uploadedData);

    alert('Backend not connected yet');

    this.showPreviewModal = false;
  }

  closePreview() {
    this.showPreviewModal = false;
  }

}
