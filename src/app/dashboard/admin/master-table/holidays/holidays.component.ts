import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-holidays',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.css']
})
export class HolidaysComponent {

  currentYear = 2026;
  currentMonth = 0;
  isFlipping = false;

  months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

  holidays = [
    { date: '2026-01-01', name: "New Year's Day", type: 'R' },
    { date: '2026-01-14', name: "Pongal / Makar Sankranti", type: 'R' },
    { date: '2026-01-26', name: "Republic Day", type: 'G' }
  ];

  get calendarDays() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const totalDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const daysArray: any[] = [];
    for (let i = 0; i < firstDay; i++) daysArray.push(null);
    for (let d = 1; d <= totalDays; d++) daysArray.push(d);
    return daysArray;
  }

  get monthHolidays() {
    return this.holidays.filter(h =>
      h.date.startsWith(`${this.currentYear}-${String(this.currentMonth+1).padStart(2,'0')}`)
    );
  }

  isHoliday(day: number) {
    const date = `${this.currentYear}-${String(this.currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return this.holidays.find(h => h.date === date);
  }

  prevMonth() {
    this.currentMonth === 0 ? (this.currentMonth = 11, this.currentYear--) : this.currentMonth--;
  }

  nextMonth() {
    this.currentMonth === 11 ? (this.currentMonth = 0, this.currentYear++) : this.currentMonth++;
  }

  flipNext() {
    this.isFlipping = true;
    setTimeout(() => { this.nextMonth(); this.isFlipping = false; }, 600);
  }

  flipPrev() {
    this.isFlipping = true;
    setTimeout(() => { this.prevMonth(); this.isFlipping = false; }, 600);
  }
}
