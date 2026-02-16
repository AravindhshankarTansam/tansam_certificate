import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-certificate-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificate-access.component.html',
  styleUrl: './certificate-access.component.css'
})
export class CertificateAccessComponent implements OnInit {

  token: string = '';
  idValue: string = '';
  otp: string = '';

  step: number = 1;

  profile: any = null;   // ⭐ add this

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  verifyId() {
    if (!this.idValue) {
      alert('Enter ID');
      return;
    }

    this.api.verifyId(this.token, this.idValue).subscribe({
      next: () => this.step = 2,
      error: () => alert('ID mismatch')
    });
  }

  verifyOtp() {
    if (!this.otp) {
      alert('Enter OTP');
      return;
    }

    this.api.verifyOtp(this.token, this.otp).subscribe({
      next: () => {
        this.loadProfile();  // ⭐ load profile
      },
      error: () => alert('Invalid OTP')
    });
  }

  /* ⭐ LOAD PROFILE */
  loadProfile() {
    this.api.getCertificateProfile(this.token).subscribe({
      next: (res: any) => {
        this.profile = res;
        this.step = 3;
      },
      error: () => alert('Unauthorized')
    });
  }

  /* ⭐ DOWNLOAD CERTIFICATE */
  download() {
    this.api.downloadCertificate(this.token).subscribe({
      next: (blob: Blob) => {

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = 'certificate.pdf';
        a.click();

        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Download failed')
    });
  }
}

