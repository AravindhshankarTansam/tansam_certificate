import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import * as XLSX from 'xlsx';

@Component({
  selector: "app-transactions-fdp-bulk-upload",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./transactions-fdpbulkupload.component.html",
  styleUrls: ["./transactions-fdpbulkupload.component.css"]
})
export class TransactionsFdpBulkUploadComponent {

  /* ===== FORM FIELDS ===== */
  collegeName: string = '';
  collegeShortCode: string = '';
  fromDate: string = '';
  toDate: string = '';

  /* ===== FILE ===== */
  selectedFile: File | null = null;
  fileName = '';

  /* ===== TABLE DATA ===== */
  uploadedData: any[] = [];
  tableHeaders: string[] = [];
  rows: any[] = [];

  showPreview = false;

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

      this.uploadedData = data;
      this.tableHeaders = Object.keys(data[0]);
      this.showPreview = true;
    };

    reader.readAsBinaryString(this.selectedFile);
  }

  /* ================= CONFIRM ================= */

  confirmUpload() {

    this.rows = [...this.rows, ...this.uploadedData];

    this.showPreview = false;
    this.selectedFile = null;
    this.fileName = '';
  }

  /* ================= DOWNLOAD TEMPLATE ================= */

  downloadTemplate() {

    const templateData = [
      {
        staff_name: '',
        college_name: '',
        payment_mode: '',
        amount: '',
        transaction_id: '',
        payment_date: ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FDP_Template");

    XLSX.writeFile(wb, "FDP_Transactions_Template.xlsx");
  }

}
