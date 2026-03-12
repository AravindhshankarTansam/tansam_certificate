import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-certificate-industry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate-industry.component.html',
  styleUrl: './certificate-industry.component.css'
})
export class CertificateIndustryComponent implements OnInit {

  batches: any[] = [];
  employees: any[] = [];

  totalEmployees = 0;
  totalGenerated = 0;
  totalPending = 0;

  showModal = false;
  selectedBatch:any = null;

  constructor(private api:ApiService){}

  ngOnInit(){
    this.loadBatches();
  }

  /* ================= LOAD BATCHES ================= */

  loadBatches(){

    this.api.getBulkIndustryBatches()
    .subscribe((res:any)=>{

      this.batches = res;

      this.totalEmployees = res.reduce(
        (sum:any,b:any)=>sum+(b.total_employees||0),0
      );

      this.totalGenerated = res.reduce(
        (sum:any,b:any)=>sum+(b.generated_count||0),0
      );

      this.totalPending = this.totalEmployees - this.totalGenerated;

    });

  }

  /* ================= VIEW EMPLOYEES ================= */

  viewBatch(batch:any){

    this.selectedBatch = batch;
    this.showModal = true;

    this.api.getBulkIndustryEmployees(batch.id)
    .subscribe((res:any)=>{
      this.employees = res;
    });

  }

  closeModal(){
    this.showModal = false;
    this.employees = [];
  }

  /* ================= DOWNLOAD SINGLE ================= */

  download(employeeId:number){

    this.api.downloadSingleIndustryCertificate(employeeId)
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

    this.api.bulkDownloadIndustryCertificates(batchId)
    .subscribe((blob:any)=>{

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = "INDUSTRY_CERTIFICATES.zip";
      a.click();

      window.URL.revokeObjectURL(url);

    });

  }

}
