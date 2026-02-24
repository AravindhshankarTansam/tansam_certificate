import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../../../services/api.service";

@Component({
  selector: 'app-tl-industry-bulk-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tl-industryupload.component.html',
  styleUrls: ['./tl-industryupload.component.css']
})
export class TlIndustryUploadComponent implements OnInit {

  batches: any[] = [];
  employees: any[] = [];

  selectedBatch: any = null;
  selectedEmployee: any = null;

  showEmployeeModal = false;
  showCalendar = false;

  calendarDays: string[] = [];
  holidays: string[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadBatches();
  }

  /* ================= LOAD INDUSTRY BATCHES ================= */
  loadBatches() {
    this.api.getBulkIndustryBatches().subscribe(res => {
      this.batches = res;
    });
  }

  /* ================= OPEN EMPLOYEE ================= */
  openEmployees(batch: any) {
    this.selectedBatch = batch;
    this.showEmployeeModal = true;

    this.api.getBulkIndustryEmployees(batch.id).subscribe(res => {
      this.employees = res;
    });
  }

  closeEmployees() {
    this.showEmployeeModal = false;
  }

  /* ================= OPEN CALENDAR ================= */
  openCalendar(emp: any) {
    this.selectedEmployee = emp;
    this.showCalendar = true;

    this.generateDates(emp.from_date, emp.to_date);
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
    if (!this.selectedEmployee) return;

    const year = new Date(this.selectedEmployee.from_date).getFullYear();

    this.api.getTlHolidays(year).subscribe(res => {
      this.holidays = res.map((h: any) => h.holiday_date);
    });
  }

  /* ================= TOGGLE ================= */
  toggleDate(date: string) {

    if (this.holidays.includes(date)) return;

    let list = this.selectedEmployee.present_dates || [];

    if (typeof list === 'string') {
      list = JSON.parse(list);
    }

    if (list.includes(date)) {
      list = list.filter((d: string) => d !== date);
    } else {
      list.push(date);
    }

    this.selectedEmployee.present_dates = list;

    this.api.markBulkIndustryAttendance(
      this.selectedEmployee.id,
      list
    ).subscribe();
  }

  isPresent(date: string) {
    return this.selectedEmployee?.present_dates?.includes(date);
  }

  isHoliday(date: string) {
    return this.holidays.includes(date);
  }
}
