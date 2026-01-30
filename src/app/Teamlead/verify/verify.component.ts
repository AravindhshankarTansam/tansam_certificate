import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-verify',
  template: `
    <div class="verify-box" [class.error]="!isValid">
      <h2 *ngIf="isValid">✅ Certificate Verified</h2>
      <h2 *ngIf="!isValid">❌ Certificate Not Found</h2>

      <p><b>Issued by TANSAM</b></p>
      <p *ngIf="certificateNo">
        Certificate No: {{ certificateNo }}
      </p>

      <p *ngIf="!isValid && certificateNo" style="margin-top: 12px;">
        This certificate is not valid.
      </p>

      <p *ngIf="!certificateNo" style="margin-top: 12px;">
        Invalid verification link.
      </p>
    </div>
  `,
  styles: [`
    .verify-box {
      max-width: 420px;
      margin: 80px auto;
      padding: 24px;
      text-align: center;
      border-radius: 12px;
      border: 2px solid green;
      font-family: Arial, sans-serif;
    }
    .error {
      border-color: red;
    }
  `]
})
export class VerifyComponent implements OnInit {

  certificateNo = '';
  isValid: boolean | null = null;

  // 🔐 MOCK DATABASE (replace with API later)
  private validCertificates: string[] = [
    'TCOE/112025/DT/028'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const encodedCert = this.route.snapshot.paramMap.get('certificateNo');

    // ❌ No certificate in URL
    if (!encodedCert) {
      this.isValid = false;
      return;
    }

    // ✅ Decode certificate number
    this.certificateNo = decodeURIComponent(encodedCert);

    // ✅ Validate certificate
    this.isValid = this.validCertificates.includes(this.certificateNo);
  }
}
