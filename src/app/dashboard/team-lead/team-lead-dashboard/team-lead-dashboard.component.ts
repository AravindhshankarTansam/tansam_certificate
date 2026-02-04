import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-team-lead-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-lead-dashboard.component.html',
  styleUrls: ['./team-lead-dashboard.component.css']
})
export class TeamLeadDashboardComponent {
  sdpCount = 0;
  fdpCount = 0;
  industryCount = 0;
  overallCount = 0;

  isPopupOpen = false;
  selectedCard: 'SDP' | 'FDP' | 'Industry' | '' = '';

  allItems: any[] = [];
  paginatedItems: any[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  cardFullNames: Record<'SDP' | 'FDP' | 'Industry', string> = {
    SDP: 'Student Development Program',
    FDP: 'Faculty Development Program',
    Industry: 'Industry Development Program'
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadCounts();
  }

  /* ================= LOAD DASHBOARD COUNTS ================= */
  loadCounts() {
    // ✅ SDP
    this.api.getTlSDP().subscribe(res => {
      const data = this.extractData(res);
      this.sdpCount = data.length;
      this.updateOverallCount();
    });

    // ✅ FDP
    this.api.getFDP().subscribe(res => {
      const data = this.extractData(res);
      this.fdpCount = data.length;
      this.updateOverallCount();
    });

    // ✅ Industry
    this.api.getIndustry().subscribe(res => {
      const data = this.extractData(res);
      this.industryCount = data.length;
      this.updateOverallCount();
    });
  }

  updateOverallCount() {
    this.overallCount = this.sdpCount + this.fdpCount + this.industryCount;
  }

  /* ================= CARD CLICK ================= */
  openPopup(type: 'SDP' | 'FDP' | 'Industry') {
    this.selectedCard = type;
    this.isPopupOpen = true;

    if (type === 'SDP') this.loadStudents();
    if (type === 'FDP') this.loadFaculty();
    if (type === 'Industry') this.loadIndustry();
  }

  /* ================= LOAD DATA ================= */
  loadStudents() {
    this.api.getTlSDP().subscribe(res => this.setItems(this.extractData(res), 'student'));
  }

  loadFaculty() {
    this.api.getFDP().subscribe(res => this.setItems(this.extractData(res), 'faculty'));
  }

  loadIndustry() {
    this.api.getIndustry().subscribe(res => this.setItems(this.extractData(res), 'industry'));
  }

  /* ================= MAP DATA ================= */
  setItems(data: any[], type: 'student' | 'faculty' | 'industry') {
    this.allItems = data.map(item => {
      return {
        name: item.student_name || item.faculty_name || item.employee_name || item.name || 'N/A',
        register: item.register_no || item.faculty_id || item.employee_id || item.reg_no || 'N/A',
        attendance: item.present_dates?.length || item.attendance || 'N/A',
        certificate: item.certificate || 'N/A',
        is_eligible: item.is_eligible ?? false
      };
    });
    this.setupPagination();
  }

  /* ================= HELPER: EXTRACT DATA ================= */
  extractData(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    return res.data || [];
  }

  /* ================= PAGINATION ================= */
  setupPagination() {
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.allItems.length / this.itemsPerPage) || 1;
    this.updatePage();
  }

  updatePage() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedItems = this.allItems.slice(start, start + this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePage();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePage();
    }
  }

  /* ================= CLOSE POPUP ================= */
  closePopup() {
    this.isPopupOpen = false;
    this.selectedCard = '';
    this.allItems = [];
    this.paginatedItems = [];
  }

  /* ================= GET FULL NAME ================= */
  getSelectedCardFullName(): string {
    return this.selectedCard ? this.cardFullNames[this.selectedCard] : '';
  }
}
