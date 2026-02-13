import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-certificate-industrial-visits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificate-industrial-visits.component.html',
  styleUrl: './certificate-industrial-visits.component.css'
})
export class CertificateIndustrialVisitsComponent implements OnInit {

  colleges: any[] = [];
  selectedStudents: any[] = [];
  totalCertificates = 0;
  showModal = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  } 

  loadData() {
    this.api.getIVCertificateSummary()
      .subscribe(res => {
        this.colleges = res.colleges;
        this.totalCertificates = res.total;
      });
  }

openCollege(visitId: number) {
  this.api.getVisitStudents(visitId)
    .subscribe(res => {
      this.selectedStudents = res;
      this.showModal = true;
    });
}


  closeModal() {
    this.showModal = false;
    this.selectedStudents = [];
  }

download(id: number) {
  this.api.downloadIVCertificate(id).subscribe(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Certificate.pdf';
    a.click();
    window.URL.revokeObjectURL(url);

    // refresh list after generation
    this.openCollege(this.selectedStudents[0].visit_id);
  });
}

bulkDownload(visitId: number, collegeName: string) {

  this.api.bulkDownloadIVCertificates(visitId)
    .subscribe(blob => {

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collegeName}_Certificates.zip`;
      a.click();
      window.URL.revokeObjectURL(url);

    }, err => {
      alert('No certificates available for download');
    });
}


}
