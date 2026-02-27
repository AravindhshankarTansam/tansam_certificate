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
  // Calendar Modal (view-only)
showCalendarModal = false;
selectedParticipant: any = null;
calendarDays: string[] = [];
holidays: string[] = [];
isLoadingCalendar = false;

presentCount = 0;
totalWorkingDays = 0;
attendancePercentage = 0;

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
  // console.log('Button clicked! Batch:', batch);
  // console.log('Selected type:', this.selectedType);
  // console.log('Batch ID:', batch?.id);

  this.selectedBatchForModal = batch;
  this.participants = [];
  this.isLoadingParticipants = true;
  this.showParticipantModal = true;
  

  let apiCall;

  switch (this.selectedType) {
    case 'sdp':
      // console.log('Calling getBulkSdpStudents for batch ID:', batch.id);
      apiCall = this.api.getBulkSdpStudents(batch.id);
      break;

    case 'fdp':
      // console.log('Calling getBulkFdpStudents for batch ID:', batch.id);
      apiCall = this.api.getBulkFdpStudents(batch.id);
      break;

    case 'industry':
      // console.log('Calling getBulkIndustryEmployees for batch ID:', batch.id);
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
      // console.log('Participants loaded:', res);
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

// New: Open calendar for a participant (view-only)
openCalendarForParticipant(participant: any) {
  this.selectedParticipant = participant;
  this.showCalendarModal = true;
  this.isLoadingCalendar = true;
  this.calendarDays = [];
  this.holidays = [];

  // Generate dates from batch (or participant if it has from/to)
  const from = this.selectedBatchForModal?.from_date;
  const to = this.selectedBatchForModal?.to_date;

  if (from && to) {
    this.generateCalendarDays(from, to);
  } else {
    console.warn('No date range found for batch');
    this.isLoadingCalendar = false;
  }

  // Load holidays
  this.loadHolidaysForCalendar();
}

// Generate dates
generateCalendarDays(from: string, to: string) {
  const dates: string[] = [];
  let start = new Date(from);
  const end = new Date(to);

  while (start <= end) {
    const y = start.getFullYear();
    const m = String(start.getMonth() + 1).padStart(2, '0');
    const d = String(start.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    start.setDate(start.getDate() + 1);
  }

  this.calendarDays = dates;
}

// Load holidays (use year from batch)
loadHolidaysForCalendar() {
  if (!this.selectedBatchForModal?.from_date) {
    this.isLoadingCalendar = false;
    return;
  }

  const year = new Date(this.selectedBatchForModal.from_date).getFullYear();

  this.api.getTlHolidays(year).subscribe({
    next: (res: any[]) => {
      this.holidays = res.map((h: any) => h.holiday_date);
      this.calculateSummary();
      this.isLoadingCalendar = false;
    },
    error: (err) => {
      console.error('Failed to load holidays:', err);
      this.isLoadingCalendar = false;
    }
  });
}

// Calculate summary
calculateSummary() {
  if (!this.selectedParticipant?.present_dates) {
    this.presentCount = 0;
    this.totalWorkingDays = this.calendarDays.filter(d => !this.holidays.includes(d)).length;
    this.attendancePercentage = 0;
    return;
  }

  let presentDates = this.selectedParticipant.present_dates;

  // Handle if backend sends stringified array
  if (typeof presentDates === 'string') {
    try {
      presentDates = JSON.parse(presentDates);
    } catch {
      presentDates = [];
    }
  }

  this.presentCount = presentDates.length;
  this.totalWorkingDays = this.calendarDays.filter(d => !this.holidays.includes(d)).length;
  this.attendancePercentage = this.totalWorkingDays > 0 
    ? Math.round((this.presentCount / this.totalWorkingDays) * 100) 
    : 0;
}

// Helpers for calendar display
isPresent(date: string): boolean {
  if (!this.selectedParticipant?.present_dates) return false;
  let presentDates = this.selectedParticipant.present_dates;
  if (typeof presentDates === 'string') {
    try { presentDates = JSON.parse(presentDates); } catch { presentDates = []; }
  }
  return presentDates.includes(date);
}

isHoliday(date: string): boolean {
  return this.holidays.includes(date);
}

formatDay(date: string): string {
  return date.split('-')[2]; // just day number
}

// Close calendar
closeCalendarModal() {
  this.showCalendarModal = false;
  this.selectedParticipant = null;
  this.calendarDays = [];
  this.holidays = [];
  this.isLoadingCalendar = false;
}
}
