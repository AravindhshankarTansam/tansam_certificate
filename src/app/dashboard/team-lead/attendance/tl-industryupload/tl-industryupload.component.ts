import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from '@angular/material/icon';
import { BulkStorageService } from '../../../../services/bulk-storage.service';

@Component({
  selector: 'app-tl-industry-bulk-upload',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './tl-industryupload.component.html',
  styleUrls: ['./tl-industryupload.component.css']
})
export class TlIndustryUploadComponent implements OnInit {

  batches: any[] = [];

  showStaffModal = false;
  selectedBatch: any = null;

  showCalendar = false;
  selectedStaff: any = null;

  calendarDays: string[] = [];

  constructor(private bulkStorage: BulkStorageService) {}

  ngOnInit(): void {
    this.loadBatches();
  }

  /* ================= LOAD FROM SERVICE ================= */

  loadBatches() {
    this.batches = this.bulkStorage.getIndustryBatches();
  }

  /* ================= VIEW ================= */

  openStaff(batch: any) {
    this.selectedBatch = batch;
    this.showStaffModal = true;
  }

  closeStaff() {
    this.showStaffModal = false;
  }

  /* ================= DOWNLOAD (FRONTEND DEMO) ================= */

  downloadBatch(batch: any) {
    alert("Download all Industry certificates (demo)");
  }

  downloadStaff(s: any) {
    alert("Download certificate for: " + s.participant_name);
  }

  /* ================= ATTENDANCE ================= */

  openCalendar(staff: any) {
    this.selectedStaff = staff;
    this.showCalendar = true;
    this.generateDates(staff.from_date, staff.to_date);
  }

  closeCalendar() {
    this.showCalendar = false;
    this.selectedStaff = null;
  }

  generateDates(from: string, to: string) {

    const dates: string[] = [];

    const start = new Date(from);
    const end = new Date(to);

    while (start <= end) {

      const yyyy = start.getFullYear();
      const mm = String(start.getMonth() + 1).padStart(2, '0');
      const dd = String(start.getDate()).padStart(2, '0');

      dates.push(`${yyyy}-${mm}-${dd}`);

      start.setDate(start.getDate() + 1);
    }

    this.calendarDays = dates;
  }

  isPresent(date: string) {
    return this.selectedStaff?.present_dates?.includes(date);
  }

}
