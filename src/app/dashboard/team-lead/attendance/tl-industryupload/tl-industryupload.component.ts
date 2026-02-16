import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../../../services/api.service";
import { CommonModule } from "@angular/common";
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-tl-industry-bulk-upload',
    standalone:true,
    imports:[CommonModule,MatIconModule],
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
  holidays: string[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadStaff();
  }

  /* ================= LOAD DATA ================= */

  loadStaff() {
    this.api.getTlIndustry().subscribe((res: any[]) => {
      this.batches = this.groupByBatch(res);
    });
  }

  /* ================= GROUP BY INDUSTRY + DATE ================= */

  groupByBatch(data: any[]) {

    const grouped: any = {};

    data.forEach(s => {

      const key = `${s.industry_name}_${s.from_date}_${s.to_date}`;

      if (!grouped[key]) {
        grouped[key] = {
          industry_name: s.industry_name,
          from_date: s.from_date,
          to_date: s.to_date,
          staffs: []
        };
      }

      grouped[key].staffs.push(s);
    });

    return Object.values(grouped);
  }

  /* ================= VIEW STAFF ================= */

  openStaff(batch: any) {
    this.selectedBatch = batch;
    this.showStaffModal = true;
  }

  closeStaff() {
    this.showStaffModal = false;
  }

  /* ================= DOWNLOAD ================= */

  downloadBatch(batch: any) {
    batch.staffs.forEach((s: any) => {
      window.open(
        `http://localhost:5055/api/certificate/generate/industry/${s.id}`
      );
    });
  }

  downloadStaff(s: any) {
    window.open(
      `http://localhost:5055/api/certificate/generate/industry/${s.id}`
    );
  }

  /* ================= ATTENDANCE VIEW ================= */

  openCalendar(staff: any) {
    this.selectedStaff = staff;
    this.showCalendar = true;

    this.generateDates(staff.from_date, staff.to_date);
    this.loadHolidays();
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

  loadHolidays() {

    if (!this.selectedStaff) return;

    const year = new Date(this.selectedStaff.from_date).getFullYear();

    this.api.getTlHolidays(year).subscribe({
      next: (res: any[]) => {
        this.holidays = res.map(h => h.holiday_date);
      }
    });
  }

  isPresent(date: string) {
    return this.selectedStaff?.present_dates?.includes(date);
  }

  isHoliday(date: string) {
    return this.holidays.includes(date);
  }
}