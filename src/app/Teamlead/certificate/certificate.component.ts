import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeModule, RouterModule],
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.css']
})
export class CertificateComponent {

  certificateData = {
    name: 'NETRA GUPTA',
    institution: 'SRM Institute of Technology',
    department: 'CINTEL',
    programme: 'IoT Data Visualization and Dashboard',
    startDate: '2025-10-14',
    endDate: '2025-11-07',
    certificateNo: 'TCOE/112025/DT/028'
  };

  // QR for real certificate
  get qrValue(): string {
    return `/verify/${encodeURIComponent(
      this.certificateData.certificateNo
    )}`;
  } //

  // // 🔴 QR for testing fake certificate
  // fakeCertUrl = '/verify/TCOE%2F999999%2FFAKE%2F001';
}
