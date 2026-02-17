import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-fdp-bulk-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fdpbulkupload.component.html',
  styleUrls: ['./fdpbulkupload.component.css']
})
export class FdpBulkUploadComponent {

  institutionName = '';
  institutionShortName = '';
  fromDate = '';
  toDate = '';

  showPreviewModal = false;
  uploadedData: any[] = [];
  tableHeaders: string[] = [];
    batches: any[] = [];
  selectedBatch: any = null;
  showBatchDetails = false;

  selectedFile: File | null = null;
  fileName = '';
  isDragActive = false;

  requiredHeaders = [
    'staff_name',
    'designation',
    'institution_name',
    'department',
    'phone',
    'email',
    'lab_id',
    'from_date',
    'to_date'
  ];

  /* FILE SELECT */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    this.fileName = file.name;
  }

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
    const missing = this.requiredHeaders.filter(h => !headers.includes(h));

    if (missing.length) {
      alert('Missing columns: ' + missing.join(', '));
      return;
    }

    // Attach form values
    this.uploadedData = data.map(row => ({
      ...row,
      from_date: this.fromDate,
      to_date: this.toDate
    }));

  };

  reader.readAsBinaryString(this.selectedFile);
}


  /* DRAG EVENTS */
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

  /* READ EXCEL */
  private readExcel(file: File) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' });

      if (!data.length) return alert('Empty sheet');

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

    reader.readAsBinaryString(file);
  }

  /* TEMPLATE DOWNLOAD */
  downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([this.requiredHeaders]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'FDP_Template');
    XLSX.writeFile(wb, 'FDP_Bulk_Template.xlsx');
  }

  /* CONFIRM */
confirmUpload() {

  if (!this.uploadedData.length) return;

  const newBatch = {
    institution_name: this.institutionName,
    institution_short_name: this.institutionShortName,
    from_date: this.fromDate,
    to_date: this.toDate,
    total_participants: this.uploadedData.length,
    participants: [...this.uploadedData]
  };

  // Store as single batch row
  this.batches.push(newBatch);

  // Clear preview
  this.uploadedData = [];

  // Reset file
  this.selectedFile = null;
  this.fileName = '';

  // Reset form (optional)
  this.institutionName = '';
  this.institutionShortName = '';
  this.fromDate = '';
  this.toDate = '';
}


  closePreview() {
    this.showPreviewModal = false;
  }
    viewBatch(batch: any) {
    this.selectedBatch = batch;
    this.showBatchDetails = true;
  }

  closeBatchDetails() {
    this.showBatchDetails = false;
    this.selectedBatch = null;
  }
}
