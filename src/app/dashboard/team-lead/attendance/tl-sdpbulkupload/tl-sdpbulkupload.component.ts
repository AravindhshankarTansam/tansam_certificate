import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../../../services/api.service";

@Component({
  selector: "app-tl-sdp-bulk-upload",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./tl-sdpbulkupload.component.html",
  styleUrls: ["./tl-sdpbulkupload.component.css"]
})
export class TlSdpBulkUploadComponent implements OnInit {

  batches: any[] = [];
  students: any[] = [];

  selectedBatch: any = null;
  selectedStudent: any = null;

  showStudentsModal = false;
  showCalendar = false;

  calendarDays: string[] = [];
  holidays: string[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadBatches();
  }

  /* ================= LOAD BATCHES ================= */
  loadBatches() {
    this.api.getBulkSdpBatches().subscribe(res => {
      this.batches = res;
    });
  }

  /* ================= OPEN STUDENTS ================= */
  openStudents(batch: any) {
    this.selectedBatch = batch;
    this.showStudentsModal = true;

    this.api.getBulkSdpStudents(batch.id).subscribe(res => {
      this.students = res;
    });
  }

  closeStudents() {
    this.showStudentsModal = false;
  }

  /* ================= OPEN CALENDAR ================= */
  openCalendar(student: any) {
    this.selectedStudent = student;
    this.showCalendar = true;

    this.generateDates(student.from_date, student.to_date);
    this.loadHolidays();
  }

  closeCalendar() {
    this.showCalendar = false;
  }

  /* ================= DATE LIST ================= */
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
    if (!this.selectedStudent) return;

    const year = new Date(this.selectedStudent.from_date).getFullYear();

    this.api.getTlHolidays(year).subscribe(res => {
      this.holidays = res.map((h: any) => h.holiday_date);
    });
  }

  /* ================= TOGGLE ================= */
  toggleDate(date: string) {

    if (this.holidays.includes(date)) return;

    let list = this.selectedStudent.present_dates || [];

    if (typeof list === 'string') {
      list = JSON.parse(list);
    }

    if (list.includes(date)) {
      list = list.filter((d: string) => d !== date);
    } else {
      list.push(date);
    }

    this.selectedStudent.present_dates = list;

    this.api.markBulkSdpAttendance(
      this.selectedStudent.id,
      list
    ).subscribe();
  }

  isPresent(date: string) {
    return this.selectedStudent?.present_dates?.includes(date);
  }

  isHoliday(date: string) {
    return this.holidays.includes(date);
  }

}
