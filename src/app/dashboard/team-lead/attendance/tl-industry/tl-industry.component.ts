import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-tl-industry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tl-industry.component.html',
  styleUrl: './tl-industry.component.css'
})
export class TlIndustryComponent implements OnInit {

  /* ================= STATE ================= */

  trainees: any[] = [];
  holidays: string[] = [];

  loading = false;

  selectedTrainee: any = null;
  showCalendar = false;

  calendarDays: string[] = [];

  constructor(private api: ApiService) {}

  /* ================= INIT ================= */

  ngOnInit() {
    this.loadTrainees();
  }


  /* =====================================================
     LOAD INDUSTRY TRAINEES
  ===================================================== */

  loadTrainees() {

    this.loading = true;

    console.log('📡 Fetching Industry trainees...');

    this.api.getTlIndustry().subscribe({

      next: (res) => {
        console.log('🔥 Industry Trainees =>', res);
        console.table(res);

        this.trainees = res || [];
        this.loading = false;
      },

      error: (err) => {
        console.error('❌ Industry API Error =>', err);
        this.loading = false;
      }

    });
  }


  /* =====================================================
     OPEN / CLOSE CALENDAR
  ===================================================== */

  openCalendar(trainee: any) {

    this.selectedTrainee = trainee;
    this.showCalendar = true;

    this.generateDates(trainee.from_date, trainee.to_date);
    this.loadHolidays();
  }

  closeCalendar() {
    this.showCalendar = false;
    this.selectedTrainee = null;
  }


  /* =====================================================
     GENERATE DATES
  ===================================================== */

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


  /* =====================================================
     LOAD HOLIDAYS
  ===================================================== */

  loadHolidays() {

    if (!this.selectedTrainee) return;

    const year = new Date(this.selectedTrainee.from_date).getFullYear();

    this.api.getTlHolidays(year).subscribe({

      next: (res: any[]) => {
        this.holidays = res.map(h => h.holiday_date);
      },

      error: (err) => console.error(err)
    });
  }


  /* =====================================================
     TOGGLE ATTENDANCE
  ===================================================== */

  toggleDate(date: string) {

    if (this.holidays.includes(date) || !this.isEditable(date)) return;

    const list = this.selectedTrainee.present_dates || [];

    if (list.includes(date)) {

      this.selectedTrainee.present_dates =
        list.filter((d: string) => d !== date);

    } else {

      list.push(date);
    }

    this.api.markTlIndustryDate(this.selectedTrainee.id, date).subscribe();
  }


  /* =====================================================
     HELPERS
  ===================================================== */

  isPresent(date: string) {
    return this.selectedTrainee?.present_dates?.includes(date);
  }

  isHoliday(date: string) {
    return this.holidays.includes(date);
  }

  getPresentCount() {
    return this.selectedTrainee?.present_dates?.length || 0;
  }

  getTotalDays() {
    return this.calendarDays.filter(d => !this.holidays.includes(d)).length;
  }

  getPercentage() {
    const total = this.getTotalDays();
    if (!total) return 0;

    return Math.round((this.getPresentCount() / total) * 100);
  }


  /* =====================================================
     EDIT RULE
  ===================================================== */

  isEditable(date: string): boolean {

    const today = new Date();
    const d = new Date(date);

    today.setHours(0,0,0,0);
    d.setHours(0,0,0,0);

    const diffDays =
      (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return false;

    return diffDays <= 2;
  }

  downloadCert(type:string,id:number){
  window.open(`http://localhost:5055/api/certificate/generate/${type}/${id}`);
}


}
