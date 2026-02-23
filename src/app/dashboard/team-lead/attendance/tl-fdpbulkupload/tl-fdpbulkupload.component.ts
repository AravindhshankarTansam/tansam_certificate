import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../../../services/api.service";

@Component({
  selector: "app-tl-fdp-bulk-upload",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./tl-fdpbulkupload.component.html",
  styleUrls: ["./tl-fdpbulkupload.component.css"]
})
export class TlFdpBulkUploadComponent implements OnInit {

  batches: any[] = [];
  staff: any[] = [];

  selectedBatch: any = null;
  selectedStaff: any = null;

  showStaffModal = false;
  showCalendar = false;

  calendarDays: string[] = [];
  holidays: string[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadBatches();
  }

  /* ================= LOAD BATCHES ================= */
  loadBatches() {
    this.api.getBulkFdpBatches().subscribe(res => {
      this.batches = res;
    });
  }

  /* ================= OPEN STAFF ================= */
  openStaff(batch: any) {
    this.selectedBatch = batch;
    this.showStaffModal = true;

    this.api.getBulkFdpStudents(batch.id).subscribe(res => {
      this.staff = res;
    });
  }

  closeStaff() {
    this.showStaffModal = false;
  }

  /* ================= OPEN CALENDAR ================= */
  openCalendar(s: any) {
    this.selectedStaff = s;
    this.showCalendar = true;

    this.generateDates(s.from_date, s.to_date);
    this.loadHolidays();
  }

  closeCalendar() {
    this.showCalendar = false;
  }

  /* ================= DATE RANGE ================= */
  generateDates(from: string, to: string) {
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

  /* ================= HOLIDAYS ================= */
  loadHolidays() {
    if (!this.selectedStaff) return;

    const year = new Date(this.selectedStaff.from_date).getFullYear();

    this.api.getTlHolidays(year).subscribe(res => {
      this.holidays = res.map((h: any) => h.holiday_date);
    });
  }

  /* ================= TOGGLE ================= */
  toggleDate(date: string) {

    if (this.holidays.includes(date)) return;

    let list = this.selectedStaff.present_dates || [];

    if (typeof list === 'string') {
      list = JSON.parse(list);
    }

    if (list.includes(date)) {
      list = list.filter((d: string) => d !== date);
    } else {
      list.push(date);
    }

    this.selectedStaff.present_dates = list;

    this.api.markBulkFdpAttendance(
      this.selectedStaff.id,
      list
    ).subscribe();
  }

  isPresent(date: string) {
    return this.selectedStaff?.present_dates?.includes(date);
  }

  isHoliday(date: string) {
    return this.holidays.includes(date);
  }
}
