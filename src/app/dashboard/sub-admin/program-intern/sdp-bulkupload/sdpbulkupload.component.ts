import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { BulkStorageService } from '../../../../services/bulk-storage.service';


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
  fromDate = '';
  toDate = '';

  selectedFile: File | null = null;
  fileName: string = '';
  isDragActive: boolean = false;

  uploadedData: any[] = [];

  /* ✅ NEW */
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

constructor(private bulkStorage: BulkStorageService) {}

ngOnInit(): void {  this.batches = this.bulkStorage.getSdpBatches();}


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

      const missing = this.requiredHeaders.filter(
        h => !headers.includes(h)
      );

      if (missing.length) {
        alert('Missing columns: ' + missing.join(', '));
        return;
      }

      const enrichedData = data.map(row => ({
        ...row,
        college_name: this.collegeName,
        college_short_name: this.collegeShortName,
        from_date: this.fromDate,
        to_date: this.toDate
      }));

      this.uploadedData = enrichedData;
    };

    reader.readAsBinaryString(this.selectedFile);
  }

confirmUpload() {

  const batch = {
    college_name: this.collegeName,
    college_short_name: this.collegeShortName,
    from_date: this.fromDate,
    to_date: this.toDate,
    total_students: this.uploadedData.length,
    students: [...this.uploadedData]
  };

  /* ✅ STORE IN SHARED SERVICE */
  this.bulkStorage.addSdpBatch(batch);

  /* ✅ ALSO UPDATE LOCAL LIST */
  this.batches = this.bulkStorage.getSdpBatches();

  /* RESET FORM */
  this.uploadedData = [];
  this.selectedFile = null;
  this.fileName = '';
}



  /* ✅ VIEW DETAILS */
  viewBatch(batch: any) {
    this.selectedBatch = batch;
    this.showBatchDetails = true;
  }

  closeBatchDetails() {
    this.showBatchDetails = false;
    this.selectedBatch = null;
  }
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


}
