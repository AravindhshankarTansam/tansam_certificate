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
// Counts
  sdpCount = 0;
  fdpCount = 0;
  industryCount = 0;
  isLoadingCounts = true;

  // Table + Filter
  selectedType: '' | 'sdp' | 'fdp' | 'industry' = 'sdp'; // ← default to SDP
  batches: any[] = [];
  isLoadingBatches = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 0;

  // Modal for participants
  showParticipantModal = false;
  selectedBatchForModal: any = null;
  participants: any[] = [];
  isLoadingParticipants = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadCounts();
    this.onTypeChange(); // Load SDP batches by default
  }

  loadCounts() {
    this.isLoadingCounts = true;

    Promise.all([
      this.api.getTlSDP().toPromise(),
      this.api.getTlFDP().toPromise(),
      this.api.getTlIndustry().toPromise()
    ])
      .then(([sdpRes, fdpRes, industryRes]) => {
        this.sdpCount = Array.isArray(sdpRes) ? sdpRes.length : 0;
        this.fdpCount = Array.isArray(fdpRes) ? fdpRes.length : 0;
        this.industryCount = Array.isArray(industryRes) ? industryRes.length : 0;
        this.isLoadingCounts = false;
      })
      .catch(err => {
        console.error('Error loading counts:', err);
        this.isLoadingCounts = false;
      });
  }

  onTypeChange() {
    if (!this.selectedType) {
      this.batches = [];
      this.currentPage = 1;
      this.totalPages = 0;
      return;
    }

    this.isLoadingBatches = true;
    this.currentPage = 1;

    let apiCall;
    switch (this.selectedType) {
      case 'sdp':
        apiCall = this.api.getBulkSdpBatches();
        break;
      case 'fdp':
        apiCall = this.api.getBulkFdpBatches();
        break;
      case 'industry':
        apiCall = this.api.getBulkIndustryBatches();
        break;
      default:
        return;
    }

    apiCall.subscribe({
      next: (res: any[]) => {
        this.batches = res || [];
        this.totalPages = Math.ceil(this.batches.length / this.itemsPerPage);
        this.isLoadingBatches = false;
      },
      error: (err) => {
        console.error(`Error loading ${this.selectedType} batches:`, err);
        this.isLoadingBatches = false;
      }
    });
  }

  get paginatedBatches() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.batches.slice(start, start + this.itemsPerPage);
  }

  changePage(delta: number) {
    const newPage = this.currentPage + delta;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
    }
  }

  // Open participant list modal
// Open participant list modal
viewBatch(batch: any) {
  console.log('Button clicked! Batch:', batch);
  console.log('Selected type:', this.selectedType);
  console.log('Batch ID:', batch?.id);

  this.selectedBatchForModal = batch;
  this.participants = [];
  this.isLoadingParticipants = true;
  this.showParticipantModal = true;

  let apiCall;

  switch (this.selectedType) {
    case 'sdp':
      console.log('Calling getBulkSdpStudents for batch ID:', batch.id);
      apiCall = this.api.getBulkSdpStudents(batch.id);
      break;

    case 'fdp':
      console.log('Calling getBulkFdpStudents for batch ID:', batch.id);
      apiCall = this.api.getBulkFdpStudents(batch.id);
      break;

    case 'industry':
      console.log('Calling getBulkIndustryEmployees for batch ID:', batch.id);
      apiCall = this.api.getBulkIndustryEmployees(batch.id);
      break;

    default:
      console.log('No valid type selected');
      this.isLoadingParticipants = false;
      alert('Invalid programme type selected.');
      return;
  }

  apiCall.subscribe({
    next: (res: any[]) => {
      console.log('Participants loaded:', res);
      this.participants = res || [];
      this.isLoadingParticipants = false;
    },
    error: (err) => {
      console.error('API ERROR:', err);
      this.isLoadingParticipants = false;
      alert('Failed to load participant list. Check console for details.');
    }
  });
}
  closeParticipantModal() {
    this.showParticipantModal = false;
    this.selectedBatchForModal = null;
    this.participants = [];
  }

  // Placeholder: You can expand this with full calendar logic
  openCalendarForParticipant(participant: any) {
    console.log('Opening calendar for:', participant);
    alert(`Calendar would open for ${participant.student_name || participant.staff_name || participant.employee_name}`);
    // → Here you can copy your calendar modal logic from other components
  }
}
