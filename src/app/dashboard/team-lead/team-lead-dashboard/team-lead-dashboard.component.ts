import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-team-lead-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './team-lead-dashboard.component.html',
  styleUrl: './team-lead-dashboard.component.css'
})
export class TeamLeadDashboardComponent implements OnInit {
  sdpCount: number = 0;
  fdpCount: number = 0;
  industryCount: number = 0;

  isLoading: boolean = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadCounts();
  }

  loadCounts() {
    this.isLoading = true;

    // You can use Promise.all for parallel loading
    Promise.all([
      this.api.getTlSDP().toPromise(),
      this.api.getTlFDP().toPromise(),
      this.api.getTlIndustry().toPromise()
    ])
      .then(([sdpRes, fdpRes, industryRes]) => {
        this.sdpCount      = Array.isArray(sdpRes) ? sdpRes.length : 0;
        this.fdpCount      = Array.isArray(fdpRes) ? fdpRes.length : 0;
        this.industryCount = Array.isArray(industryRes) ? industryRes.length : 0;
        this.isLoading = false;
      })
      .catch(err => {
        console.error('Error loading team lead counts:', err);
        this.isLoading = false;
        // Optionally show error toast/message
      });
  }

}
