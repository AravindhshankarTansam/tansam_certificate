import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.css'
})
export class VerifyComponent implements OnInit {

  loading = true;
  error = false;
  data: any = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {

    const certNo = decodeURIComponent(
      this.route.snapshot.paramMap.get('certNo') || ''
    );

    console.log('Decoded Certificate No:', certNo); // 🔍 Debug certificate number

    if (!certNo) {
      this.error = true;
      return;
    }

this.http
  .get(`https://interncertificate.tansam.org/api/certificate/verify/${encodeURIComponent(certNo)}`)
  .subscribe({
    next: (res: any) => {

      console.log('API Response:', res);

      // ✅ If API returns empty or no certificate number
      if (!res || !res.certificate_no) {
        this.error = true;
        this.loading = false;
        return;
      }

      // ✅ Valid certificate
      this.data = res;
      this.loading = false;
    },

    error: (err) => {
      console.error('API Error:', err);
      this.error = true;
      this.loading = false;
    }
  });
  }
}
