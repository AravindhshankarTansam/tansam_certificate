import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-tl-fdp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tl-fdp.component.html',
  styleUrl: './tl-fdp.component.css',
})
export class TlFdpComponent implements OnInit {
  /* ================= STATE ================= */

  faculties: any[] = [];
  holidays: string[] = [];

  loading = false;

  selectedFaculty: any = null;
  showCalendar = false;

  calendarDays: string[] = [];

  constructor(private api: ApiService) {}

  /* ================= INIT ================= */

  ngOnInit() {
    this.loadFaculties();
  }

  /* =====================================================
     LOAD FDP FACULTY LIST
  ===================================================== */

  loadFaculties() {
    this.loading = true;

    console.log('📡 Fetching FDP Faculty list...');

    this.api.getTlFDP().subscribe({
      next: (res) => {
        console.log('🔥 FDP Faculty Response =>', res);
        console.table(res);

        this.faculties = res || [];
        this.loading = false;
      },

      error: (err) => {
        console.error('❌ FDP Faculty API Error =>', err);
        this.loading = false;
      },
    });
  }

  /* =====================================================
     OPEN / CLOSE CALENDAR
  ===================================================== */

  openCalendar(faculty: any) {
    console.log('📅 Opening calendar for:', faculty);

    this.selectedFaculty = faculty;
    this.showCalendar = true;

    this.generateDates(faculty.from_date, faculty.to_date);
    this.loadHolidays();
  }

  closeCalendar() {
    this.showCalendar = false;
    this.selectedFaculty = null;
  }

  /* =====================================================
     GENERATE DATE RANGE
  ===================================================== */

  generateDates(from: string, to: string) {
    const dates: string[] = [];

    const start = new Date(from);
    const end = new Date(to);

    while (start <= end) {
      const yyyy = start.getFullYear();
      const mm = String(start.getMonth() + 1).padStart(2, '0');
      const dd = String(start.getDate()).padStart(2, '0');

      dates.push(`${yyyy}-${mm}-${dd}`); // ✅ LOCAL DATE (NO UTC)

      start.setDate(start.getDate() + 1);
    }

    this.calendarDays = dates;
  }

  /* =====================================================
     LOAD HOLIDAYS
  ===================================================== */

  loadHolidays() {
    if (!this.selectedFaculty) return;

    const year = new Date(this.selectedFaculty.from_date).getFullYear();

    console.log('📅 Fetching Holidays for year:', year);

    this.api.getTlHolidays(year).subscribe({
      next: (res: any[]) => {
        console.log('🟡 Holidays Raw =>', res);
        console.table(res);

        this.holidays = res.map((h) => h.holiday_date);

        console.log('🟥 Holiday Dates Only =>', this.holidays);
      },

      error: (err) => console.error('❌ Holiday API Error =>', err),
    });
  }

  /* =====================================================
     TOGGLE ATTENDANCE
  ===================================================== */

  toggleDate(date: string) {
    if (this.holidays.includes(date) || !this.isEditable(date)) return;

    const list = this.selectedFaculty.present_dates || [];

    if (list.includes(date)) {
      this.selectedFaculty.present_dates = list.filter(
        (d: string) => d !== date,
      );
    } else {
      list.push(date);
    }

    console.log('✅ Marking FDP attendance:', {
      id: this.selectedFaculty.id,
      date,
    });

    this.api
      .markTlFDPDate(this.selectedFaculty.id, date)
      .subscribe((res) => console.log('✔ Saved:', res));
  }

  /* =====================================================
     UI HELPERS
  ===================================================== */

  isPresent(date: string) {
    return this.selectedFaculty?.present_dates?.includes(date);
  }

  isHoliday(date: string) {
    return this.holidays.includes(date);
  }

  /* =====================================================
     EDIT RULE
     Allow only today + last 2 days
  ===================================================== */

  isEditable(date: string): boolean {
    const today = new Date();
    const d = new Date(date);

    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    const diffDays = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return false;

    return diffDays <= 2;
  }

  downloadCert(type: string, id: number) {
    window.open(`http://localhost:5055/api/certificate/generate/${type}/${id}`);
  }
  viewCert(type: string, id: number) {
    window.open(
      `http://localhost:5055/api/certificate/generate/${type}/${id}`,
      '_blank',
    );
  }
}
