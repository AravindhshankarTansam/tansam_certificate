import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-certificate-fdp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate-fdp.component.html',
  styleUrl: './certificate-fdp.component.css'
})
export class CertificateFdpComponent implements OnInit {

  batches: any[] = [];
  students: any[] = [];

  totalStudents = 0;
  totalGenerated = 0;
  totalPending = 0;

  showModal = false;
  selectedBatch: any = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadBatches();
  }

  loadBatches() {
    this.api.getBulkFdpBatches().subscribe((res:any)=>{

      this.batches = res;

      this.totalStudents = res.reduce(
        (sum:any,b:any)=>sum+(b.total_students||0),0
      );

      this.totalGenerated = res.reduce(
        (sum:any,b:any)=>sum+(b.generated_count||0),0
      );

      this.totalPending = this.totalStudents - this.totalGenerated;

    });
  }

  viewBatch(batch:any){

    this.selectedBatch = batch;
    this.showModal = true;

    this.api.getBulkFdpStudents(batch.id)
    .subscribe((res:any)=>{
      this.students = res;
    });

  }

  closeModal(){
    this.showModal=false;
    this.students=[];
  }

  download(studentId:number){

    this.api.downloadSingleFdpCertificate(studentId)
    .subscribe((blob:any)=>{

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = "certificate.pdf";
      a.click();

      window.URL.revokeObjectURL(url);

    });

  }

  downloadAll(batchId:number){

    this.api.bulkDownloadFdpCertificates(batchId)
    .subscribe((blob:any)=>{

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = "FDP_CERTIFICATES.zip";
      a.click();

      window.URL.revokeObjectURL(url);

    });

  }

}
