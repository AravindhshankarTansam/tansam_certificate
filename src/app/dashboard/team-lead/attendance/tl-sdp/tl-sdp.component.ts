import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-tl-sdp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tl-sdp.component.html',
  styleUrl: './tl-sdp.component.css'
})
export class TlSdpComponent implements OnInit {

  students: any[] = [];
  holidays: string[] = [];

  loading = false;

  selectedStudent: any = null;
  showCalendar = false;

  calendarDays: string[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadStudents();
  }

  /* ================= LOAD STUDENTS ================= */
  loadStudents() {
    this.loading = true;

    this.api.getTlSDP().subscribe(res => {
      this.students = res;
      this.loading = false;
    });
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


  /* ================= GENERATE DATE LIST ================= */
  generateDates(from: string, to: string) {
    const dates: string[] = [];

    const start = new Date(from);
    const end = new Date(to);

    while (start <= end) {
      dates.push(start.toISOString().slice(0, 10));
      start.setDate(start.getDate() + 1);
    }

    this.calendarDays = dates;
  }


  /* ================= LOAD HOLIDAYS ================= */
  loadHolidays() {
    const today = new Date();

    this.api.getHolidays(today.getFullYear(), today.getMonth() + 1)
      .subscribe(res => {
        this.holidays = res.map(h => h.holiday_date);
      });
  }


  /* ================= TOGGLE DATE ================= */
  toggleDate(date: string) {

    if (this.holidays.includes(date)) return;

    const list = this.selectedStudent.present_dates || [];

    if (list.includes(date)) {
      this.selectedStudent.present_dates =
        list.filter((d: string) => d !== date);
    } else {
      list.push(date);
    }

    this.api.markTlSDPDate(this.selectedStudent.id, date).subscribe();
  }


  /* ================= STYLES ================= */
  isPresent(date: string) {
    return this.selectedStudent?.present_dates?.includes(date);
  }

  isHoliday(date: string) {
    return this.holidays.includes(date);
  }


  /* ================= SUMMARY ================= */
  getPresentCount() {
    return this.selectedStudent?.present_dates?.length || 0;
  }

  getTotalDays() {
    return this.calendarDays.filter(d => !this.holidays.includes(d)).length;
  }

  getPercentage() {
    const total = this.getTotalDays();
    if (!total) return 0;

    return Math.round((this.getPresentCount() / total) * 100);
  }
}
