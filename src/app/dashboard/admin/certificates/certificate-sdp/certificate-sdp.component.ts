import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-certificate-sdp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate-sdp.component.html',
  styleUrl: './certificate-sdp.component.css'
})
export class CertificateSdpComponent implements OnInit {

  batches: any[] = [];
  students: any[] = [];

  totalStudents = 0;
  totalGenerated = 0;
  totalPending = 0;

  selectedBatch: any = null;
  showModal = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadBatches();
  }

  /* ================= LOAD BATCHES ================= */

  loadBatches() {
    this.api.getBulkSdpBatches().subscribe((res:any) => {

      this.batches = res;

      this.totalStudents = res.reduce(
        (sum:any, b:any) => sum + (b.total_students || 0), 0
      );

      this.totalGenerated = res.reduce(
        (sum:any, b:any) => sum + (b.generated_count || 0), 0
      );

      this.totalPending = this.totalStudents - this.totalGenerated;

    });
  }

  /* ================= VIEW STUDENTS ================= */

  viewBatch(batch: any) {

    this.selectedBatch = batch;
    this.showModal = true;

    this.api.getBulkSdpStudents(batch.id).subscribe((res:any) => {
      this.students = res;
    });

  }

  closeModal() {
    this.showModal = false;
    this.students = [];
  }

  /* ================= DOWNLOAD SINGLE ================= */

  download(studentId:number){

    this.api.downloadSingleSdpCertificate(studentId)
    .subscribe((blob:any)=>{

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = "certificate.pdf";
      a.click();

      window.URL.revokeObjectURL(url);

    });

  }

  /* ================= BULK DOWNLOAD ================= */

  downloadAll(batchId:number){

    this.api.bulkDownloadSdpCertificates(batchId)
    .subscribe((blob:any)=>{

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = "SDP_CERTIFICATES.zip";
      a.click();

      window.URL.revokeObjectURL(url);

    });

  }

}
