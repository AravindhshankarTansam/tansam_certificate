import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import * as XLSX from "xlsx";

@Component({
  selector: "app-transactions-industry-bulk-upload",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./transactions-industrybulkupload.component.html",
  styleUrls: ["./transactions-industrybulkupload.component.css"]
})
export class TransactionsIndustryBulkUploadComponent {
 
  collegeName = '';
  collegeShortCode = '';
  fromDate = '';
  toDate = '';

  selectedFile: File | null = null;
  fileName = '';

  uploadedData: any[] = [];
  tableHeaders: string[] = [];
  showPreview = false;

  rows: any[] = [];

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

      const workbook: XLSX.WorkBook =
        XLSX.read(e.target.result, { type: "binary" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const data: any[] =
        XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!data.length) {
        alert("Excel file is empty");
        return;
      }

      this.uploadedData = data;
      this.tableHeaders = Object.keys(data[0]);
      this.showPreview = true;
    };

    reader.readAsBinaryString(this.selectedFile);
  }

  confirmUpload() {

    this.rows = [...this.rows, ...this.uploadedData];

    this.showPreview = false;
    this.uploadedData = [];

    this.selectedFile = null;
    this.fileName = '';
  }

  downloadTemplate() {

    const headers = [
      "Staff Name",
      "Amount",
      "Payment Mode",
      "Transaction Id",
      "Payment Date"
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    XLSX.writeFile(workbook, "Industry_Transactions_Template.xlsx");
  }
}
