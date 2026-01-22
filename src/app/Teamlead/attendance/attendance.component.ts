import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Employee {
  Type: 'Academic - FDP' | 'Academic - SDP' | 'Industry';
  name: string;
  programme: string;
  attendance: string[];
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent {

  // Attendance starts from Monday 19/01/2026
  startDate = new Date(2026, 0, 19);

  // Today = 21/01/2026
  today = new Date(2026, 0, 21);

  employees: Employee[] = [
    { Type: 'Academic - FDP', name: 'Luiza Leveque', programme: 'ARVR', attendance: ['Y', 'A', 'Y', '', '', '', ''] },
    { Type: 'Academic - SDP', name: 'John Mathew', programme: 'Full Stack', attendance: ['Y', 'Y', 'A', '', '', '', ''] },
    { Type: 'Industry', name: 'Suman Shine', programme: 'IOT', attendance: ['Y', 'A', 'Y', '', '', '', ''] },
    { Type: 'Academic - FDP', name: 'Neha P Byalal', programme: 'Full Stack', attendance: ['Y', 'A', 'Y', '', '', '', ''] },
    { Type: 'Academic - SDP', name: 'Kripali S', programme: 'Full Stack', attendance: ['Y', 'A', 'Y', '', '', '', ''] },
    { Type: 'Industry', name: 'Athitya', programme: 'Full Stack', attendance: ['Y', 'A', 'Y', '', '', '', ''] },
  ];

  constructor() {
    // Normalize N / U → A
    this.employees.forEach(emp => {
      emp.attendance = emp.attendance.map(v => (v === 'N' || v === 'U') ? 'A' : v);
    });
  }

  /* ===========================
     DATE HELPERS
  =========================== */

  getDateByIndex(index: number): Date {
    const d = new Date(this.startDate);
    d.setDate(this.startDate.getDate() + index);
    return d;
  }

  formatDate(index: number): string {
    return this.getDateByIndex(index).toLocaleDateString('en-GB');
  }

  isSunday(index: number): boolean {
    return this.getDateByIndex(index).getDay() === 0;
  }

  isToday(index: number): boolean {
    return this.getDateByIndex(index).toDateString() === this.today.toDateString();
  }

  isPast(index: number): boolean {
    return this.getDateByIndex(index) < this.today;
  }

  isFuture(index: number): boolean {
    return this.getDateByIndex(index) > this.today;
  }

  isEditable(index: number): boolean {
    return this.isToday(index) && !this.isSunday(index);
  }

  /* ===========================
     ATTENDANCE UPDATE
  =========================== */

  updateAttendance(emp: Employee, index: number, value: string) {
    if (!this.isEditable(index)) return;

    value = value.toUpperCase().trim();

    if (value === 'Y') {
      emp.attendance[index] = 'Y';
    } else if (value === 'N') {
      emp.attendance[index] = 'A'; // N → Absent
    } else if (value === 'A') {
      emp.attendance[index] = 'A';
    } else {
      emp.attendance[index] = emp.attendance[index] || '';
    }
  }

  /* ===========================
     UI HELPERS
  =========================== */

  isIndustry(emp: Employee): boolean {
    return emp.Type === 'Industry';
  }
}
