import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-holiday',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.css']
})
export class HolidayComponent implements OnInit {

  constructor(private api: ApiService) {}

  /* ================= Flip animation ================= */
  isFlipping = false;

  /* ================= Current month/year ================= */
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();

  /* ================= Calendar data ================= */
  holidays: any[] = [];   // ✅ from backend (NOT static)
  calendarDays: (number | null)[] = [];

  monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];


  /* =====================================================
     INIT
  ===================================================== */
  ngOnInit() {
    this.generateCalendar();
    this.loadHolidays();
  }


  /* =====================================================
     API
  ===================================================== */
  loadHolidays() {
    this.api
      .getHolidays(this.currentYear, this.currentMonth + 1)
      .subscribe(res => {

        console.table(res);

        // ⭐ convert once here
        this.holidays = res.map((h: any) => ({
          ...h,
          holiday_date: h.holiday_date.split('T')[0]
        }));
      });
  }

  /* =====================================================
     CALENDAR GENERATION
  ===================================================== */
  generateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const totalDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    this.calendarDays = [];

    for (let i = 0; i < firstDay; i++) this.calendarDays.push(null);
    for (let d = 1; d <= totalDays; d++) this.calendarDays.push(d);
  }


  /* =====================================================
     HELPERS
  ===================================================== */

  get monthHolidays() {
    return this.holidays;
  }

  formatDate(day: number) {
    return `${this.currentYear}-${String(this.currentMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }

  isHoliday(day: number | null) {
    if (!day) return null;

    const date = this.formatDate(day);

    return this.holidays.find(h => h.holiday_date === date);
  }


  isSunday(day: number | null) {
    if (!day) return false;
    return new Date(this.currentYear, this.currentMonth, day).getDay() === 0;
  }

  getDay(date: string) {
    return date.split('-')[2];
  }


  /* =====================================================
     ADD HOLIDAY (CLICK DAY)
  ===================================================== */
  addHoliday(day: number | null) {
    if (!day) return;

    // already holiday → block
    if (this.isHoliday(day)) {
      alert('Holiday already exists');
      return;
    }

    const name = prompt('Holiday name');
    if (!name) return;

    const type = prompt('Type: G = Govt, R = Restricted', 'G') as 'G' | 'R';

    this.api.addHoliday({
      holiday_date: this.formatDate(day),
      holiday_name: name,
      type: type || 'G'
    }).subscribe(() => {
      this.loadHolidays();
    });
  }


  /* =====================================================
     MONTH NAVIGATION
  ===================================================== */

  flipNext() {
    this.isFlipping = true;

    setTimeout(() => {
      this.currentMonth++;

      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }

      this.generateCalendar();
      this.loadHolidays();   // ✅ reload month
      this.isFlipping = false;
    }, 400);
  }

  flipPrev() {
    this.isFlipping = true;

    setTimeout(() => {
      this.currentMonth--;

      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }

      this.generateCalendar();
      this.loadHolidays();   // ✅ reload month
      this.isFlipping = false;
    }, 400);
  }
  isToday(day: number | null) {
  if (!day) return false;

  const today = new Date();

  return (
    day === today.getDate() &&
    this.currentMonth === today.getMonth() &&
    this.currentYear === today.getFullYear()
  );
}

}
