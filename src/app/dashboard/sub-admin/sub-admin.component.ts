import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-sub-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sub-admin.component.html',
  styleUrls: ['./sub-admin.component.css']
})
export class SubAdminComponent implements OnInit {

  sdpCount = 0;
  fdpCount = 0;
  industryCount = 0;
  overallCount = 0;

  isPopupOpen = false;
  selectedCard: 'SDP' | 'FDP' | 'Industry' | '' = '';

  allItems: any[] = [];          // holds current popup data
  paginatedItems: any[] = [];    // paginated display

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  // ================= CARD FULL NAME MAPPING =================
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
    this.api.getSDP().subscribe(res => {
      this.sdpCount = res ? res.length : 0;
      this.updateOverallCount();
    });

    this.api.getFDP().subscribe(res => {
      this.fdpCount = res ? res.length : 0;
      this.updateOverallCount();
    });

    this.api.getIndustry().subscribe(res => {
      this.industryCount = res ? res.length : 0;
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
    this.api.getSDP().subscribe(res => this.setItems(res || []));
  }

  loadFaculty() {
    this.api.getFDP().subscribe(res => this.setItems(res || []));
  }

  loadIndustry() {
    this.api.getIndustry().subscribe(res => this.setItems(res || []));
  }

  /* ================= COMMON METHOD ================= */
  setItems(data: any[]) {
    this.allItems = data;
    this.setupPagination();
  }

  /* ================= PAGINATION ================= */
  setupPagination() {
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.allItems.length / this.itemsPerPage);
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
