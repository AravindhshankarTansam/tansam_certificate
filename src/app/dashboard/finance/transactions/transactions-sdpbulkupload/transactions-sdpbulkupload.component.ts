import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import * as XLSX from 'xlsx';

@Component({
  selector: "app-transactions-sdp-bulk-upload",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./transactions-sdpbulkupload.component.html",
  styleUrls: ["./transactions-sdpbulkupload.component.css"]
})
export class TransactionsSdpBulkUploadComponent {

    /* ================= FORM FIELDS ================= */

  collegeName = '';
  collegeShortName = '';
  fromDate = '';
  toDate = '';

  selectedFile: File | null = null;
  fileName = '';

  uploadedData: any[] = [];
  tableHeaders: string[] = [];
  showPreview = false;

  rows: any[] = [];

  /* ================= FILE SELECT ================= */

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    this.fileName = file.name;
  }

  /* ================= READ EXCEL ================= */

  uploadFile() {
    if (!this.selectedFile) return;

    const reader = new FileReader();

    reader.onload = (e: any) => {

      const workbook: XLSX.WorkBook = XLSX.read(
        e.target.result,
        { type: 'binary' }
      );

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const data: any[] =
        XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (!data.length) {
        alert('Excel file is empty');
        return;
      }

      // Add extra fields into each row
      const enrichedData = data.map(row => ({
        ...row,
        college_name: this.collegeName,
        college_short_name: this.collegeShortName,
        from_date: this.fromDate,
        to_date: this.toDate
      }));

      this.uploadedData = enrichedData;
      this.tableHeaders = Object.keys(enrichedData[0]);

      this.rows = [...this.rows, ...this.uploadedData];

      alert('Transactions uploaded successfully (frontend only)');
    };

    reader.readAsBinaryString(this.selectedFile);
  }

  /* ================= TEMPLATE DOWNLOAD ================= */

  downloadTemplate() {

    const headers = [
      'student_name',
      'college_name',
      'payment_mode',
      'amount',
      'transaction_id',
      'payment_date'
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers]);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'SDP Transactions');

    XLSX.writeFile(wb, 'SDP_Transactions_Template.xlsx');
  }

}
