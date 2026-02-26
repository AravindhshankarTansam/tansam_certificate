import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sub-admin',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './sub-admin.component.html',
  styleUrl: './sub-admin.component.css'
})
export class SubAdminComponent implements OnInit{
 sdpCount: number = 0;
  fdpCount: number = 0;
  industryCount: number = 0;

  isLoadingCounts: boolean = true;
  errorMessageCounts: string = '';

  selectedType: 'sdp' | 'fdp' | 'industry' | '' = '';
  batches: any[] = [];
  isLoadingBatches: boolean = false;
  errorMessageBatches: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;

  // Modal for viewing batch details
  showBatchModal: boolean = false;
  selectedBatch: any = null;
  batchEntries: any[] = []; // students / faculty / employees
  isLoadingBatchDetails: boolean = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadCounts();
  }

  loadCounts() {
    this.isLoadingCounts = true;
    this.errorMessageCounts = '';

    Promise.all([
      this.api.getSDP().toPromise(),
      this.api.getFDP().toPromise(),
      this.api.getIndustry().toPromise()
    ])
      .then(([sdpRes, fdpRes, industryRes]) => {
        this.sdpCount = Array.isArray(sdpRes) ? sdpRes.length : 0;
        this.fdpCount = Array.isArray(fdpRes) ? fdpRes.length : 0;
        this.industryCount = Array.isArray(industryRes) ? industryRes.length : 0;
        this.isLoadingCounts = false;
      })
      .catch(err => {
        console.error('Error loading counts:', err);
        this.errorMessageCounts = 'Failed to load dashboard data.';
        this.isLoadingCounts = false;
      });
  }

  onTypeChange() {
    if (!this.selectedType) {
      this.batches = [];
      this.currentPage = 1;
      return;
    }

    this.isLoadingBatches = true;
    this.errorMessageBatches = '';
    this.currentPage = 1;

    let apiCall;
    switch (this.selectedType) {
      case 'sdp':     apiCall = this.api.getBulkSdpBatches(); break;
      case 'fdp':     apiCall = this.api.getBulkFdpBatches(); break;
      case 'industry': apiCall = this.api.getBulkIndustryBatches(); break;
      default: return;
    }

    apiCall.subscribe({
      next: (res: any[]) => {
        this.batches = res;
        this.totalPages = Math.ceil(this.batches.length / this.itemsPerPage);
        this.isLoadingBatches = false;
      },
      error: (err) => {
        console.error(`Error loading ${this.selectedType} batches:`, err);
        this.errorMessageBatches = `Failed to load ${this.selectedType.toUpperCase()} batches.`;
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

  // === NEW: Open modal to view batch details ===
  viewBatch(batch: any) {
    this.selectedBatch = batch;
    this.batchEntries = [];
    this.isLoadingBatchDetails = true;
    this.showBatchModal = true;

    let apiCall;
    switch (this.selectedType) {
      case 'sdp':
        apiCall = this.api.getBulkSdpStudents(batch.id);
        break;
      case 'fdp':
        apiCall = this.api.getBulkFdpStudents(batch.id);
        break;
      case 'industry':
        apiCall = this.api.getBulkIndustryEmployees(batch.id);
        break;
      default:
        return;
    }

    apiCall.subscribe({
      next: (entries: any[]) => {
        this.batchEntries = entries;
        this.isLoadingBatchDetails = false;
      },
      error: (err) => {
        console.error('Error loading batch entries:', err);
        this.isLoadingBatchDetails = false;
        alert('Failed to load student/faculty/employee list.');
      }
    });
  }

  closeBatchModal() {
    this.showBatchModal = false;
    this.selectedBatch = null;
    this.batchEntries = [];
  }

  // Download single certificate (example – adjust field names as per your API)
  downloadSingle(entry: any) {
    if (!entry.certificate_generated) {
      alert('Certificate not generated yet.');
      return;
    }

    let downloadApi;
    switch (this.selectedType) {
      case 'sdp':
        downloadApi = this.api.downloadSingleSdpCertificate(entry.id);
        break;
      case 'fdp':
        downloadApi = this.api.downloadSingleFdpCertificate(entry.id);
        break;
      case 'industry':
        downloadApi = this.api.downloadSingleIndustryCertificate(entry.id);
        break;
      default:
        return;
    }

    downloadApi.subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${entry.certificate_no || 'certificate'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download failed:', err);
        alert('Failed to download certificate.');
      }
    });
  }
}
