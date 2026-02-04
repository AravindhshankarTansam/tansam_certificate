import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance-dashboard.component.html',
  styleUrls: ['./finance-dashboard.component.css']
})
export class FinanceDashboardComponent {

  paidAmount = 0;
  pendingAmount = 0;
  totalAmount = 0;

  paidCount = 0;
  pendingCount = 0;
  totalCount = 0;

  isPopupOpen = false;
  selectedCard: 'PAID' | 'PENDING' | 'TOTAL' | '' = '';

  allItems: any[] = [];
  paginatedItems: any[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  cardTitles: Record<'PAID' | 'PENDING' | 'TOTAL', string> = {
    PAID: 'Paid Students (SDP)',
    PENDING: 'Pending Payments (SDP)',
    TOTAL: 'All Students (SDP)'
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadCounts();
  }

  /* ===== SINGLE SOURCE OF TRUTH ===== */
  isPaid(item: any): boolean {
    return Number(item.amount) > 0;
  }

  /* ===== LOAD COUNTS & AMOUNTS ===== */
  loadCounts() {
    this.api.getFinanceSDP().subscribe(res => {
      const data = this.extractData(res);

      const paid = data.filter(d => this.isPaid(d));
      const pending = data.filter(d => !this.isPaid(d));

      this.paidAmount = paid.reduce((s, d) => s + Number(d.amount || 0), 0);
      this.pendingAmount = pending.reduce((s, d) => s + Number(d.amount || 0), 0);
      this.totalAmount = this.paidAmount + this.pendingAmount;

      this.paidCount = paid.length;
      this.pendingCount = pending.length;
      this.totalCount = data.length;
    });
  }

  /* ===== OPEN POPUP FROM TOP CARDS ===== */
  openPopup(type: 'PAID' | 'PENDING' | 'TOTAL') {
    this.selectedCard = type;
    this.isPopupOpen = true;
    this.loadFinanceData(type);
  }

  /* ===== LOAD POPUP DATA ===== */
  loadFinanceData(type: 'PAID' | 'PENDING' | 'TOTAL') {
    this.api.getFinanceSDP().subscribe(res => {
      const data = this.extractData(res);

      let filtered: any[] = [];

      if (type === 'PAID') {
        filtered = data.filter(d => this.isPaid(d));
      } else if (type === 'PENDING') {
        filtered = data.filter(d => !this.isPaid(d));
      } else {
        filtered = data; // TOTAL
      }

      this.setItems(filtered);
    });
  }

  /* ===== MAP DATA TO TABLE ===== */
  setItems(data: any[]) {
    this.allItems = data.map(item => ({
      name: item.student_name,
      college: item.college_name,
      mode: item.payment_mode || '-',
      amount: Number(item.amount || 0),
      txnId: item.txn_id || '-',
      date: item.payment_date || '-',
      status: this.isPaid(item) ? 'PAID' : 'PENDING'
    }));

    this.setupPagination();
  }

  /* ===== HELPERS ===== */
  extractData(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    return res.data || [];
  }

  /* ===== PAGINATION ===== */
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

  /* ===== CLOSE POPUP ===== */
  closePopup() {
    this.isPopupOpen = false;
    this.selectedCard = '';
    this.allItems = [];
    this.paginatedItems = [];
  }

  getSelectedCardTitle(): string {
    return this.selectedCard ? this.cardTitles[this.selectedCard] : '';
  }
}
