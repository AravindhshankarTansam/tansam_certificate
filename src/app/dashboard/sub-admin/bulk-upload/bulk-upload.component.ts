import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.css']
})
export class BulkUploadComponent {

  selectedFile: File | null = null;
  errorMsg = '';
  fileName = '';

  constructor(private api: ApiService) {}

  /* ================= FILE SELECT ================= */
  onFileChange(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    const allowed = ['csv', 'xlsx', 'xls'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !allowed.includes(ext)) {
      this.errorMsg = 'Only Excel or CSV files are allowed';
      this.selectedFile = null;
      return;
    }

    this.errorMsg = '';
    this.selectedFile = file;
    this.fileName = file.name;
  }


  /* ================= UPLOAD ================= */
  upload() {
    if (!this.selectedFile) {
      this.errorMsg = 'Please select a file';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    // 🔹 call your API
    // this.api.uploadBulkIndustry(formData).subscribe({
    //   next: () => {
    //     alert('Upload successful ✅');
    //     this.reset();
    //   },
    //   error: () => {
    //     alert('Upload failed ❌');
    //   }
    // });
  }

  reset() {
    this.selectedFile = null;
    this.fileName = '';
  }
}
