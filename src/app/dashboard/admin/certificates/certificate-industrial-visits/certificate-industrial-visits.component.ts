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
  currentVisitId: number | null = null;

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

  this.currentVisitId = visitId;

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

download(id: number, studentName: string) {

  this.api.downloadIVCertificate(id).subscribe(blob => {

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;

    /* Use student name as filename */
    const safeName = studentName.replace(/[^a-zA-Z0-9]/g, "_");

    a.download = safeName + ".pdf";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);

    /* reload modal data */
    if (this.currentVisitId) {
      this.openCollege(this.currentVisitId);
    }

  });

}

async bulkDownload(visitId: number, collegeShort: string) {

  try {

    const students: any = await this.api
      .getVisitStudents(visitId)
      .toPromise();

    const generated = students.filter((s: any) => s.certificate_generated);

    if (!generated.length) {
      alert("No certificates generated");
      return;
    }

    /* Ask user to choose folder */
    const dirHandle = await (window as any).showDirectoryPicker();

    /* Create college folder */
    const collegeFolder = await dirHandle.getDirectoryHandle(collegeShort, {
      create: true
    });

    for (const student of generated) {

      const blob: any = await this.api
        .downloadIVCertificate(student.id)
        .toPromise();

      const fileName =
        student.certificate_no.replace(/[\/\\]/g, "_") + ".pdf";

      const fileHandle = await collegeFolder.getFileHandle(fileName, {
        create: true
      });

      const writable = await fileHandle.createWritable();

      await writable.write(blob);
      await writable.close();
    }

    alert("Certificates downloaded successfully!");

  } catch (err) {
    console.error(err);
    alert("Download cancelled or failed");
  }
}


}
