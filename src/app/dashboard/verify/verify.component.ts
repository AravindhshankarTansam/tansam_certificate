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

    const certNo = this.route.snapshot.paramMap.get('certNo');

    if (!certNo) {
      this.error = true;
      return;
    }

    this.http
      .get(`http://localhost:5055/api/certificate/verify/${certNo}`)
      .subscribe({
        next: (res: any) => {
          this.data = res;
          this.loading = false;
        },
        error: () => {
          this.error = true;
          this.loading = false;
        }
      });
  }
}
