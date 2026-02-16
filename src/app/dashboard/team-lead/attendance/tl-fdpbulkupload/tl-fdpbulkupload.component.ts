import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../../../services/api.service";
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector:'  app-tl-fdp-bulk-upload',
    standalone:true,
    imports:[CommonModule,MatIconModule],
    templateUrl: './tl-fdpbulkupload.component.html',
    styleUrls: ['./tl-fdpbulkupload.component.css']
})
export class TlFdpBulkUploadComponent implements OnInit{
   
  batches: any[] = [];

  showFacultyModal = false;
  selectedBatch: any = null;
    showStudentsModal = false;


  showCalendar = false;
  selectedStudent: any = null;

  calendarDays: string[] = [];


  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadFaculties();
  }

  /* ================= LOAD FROM DATABASE ================= */

  loadFaculties() {

    this.api.getTlFDP().subscribe((res: any[]) => {

      console.log('🔥 FDP Raw Data =>', res);

      this.batches = this.groupByBatch(res);

      console.log('📦 Grouped Batches =>', this.batches);
    });
  }

  /* ================= GROUP BY COLLEGE + DATE ================= */

  groupByBatch(data: any[]) {

    const grouped: any = {};

    data.forEach(f => {

      const key = `${f.college_name}_${f.from_date}_${f.to_date}`;

      if (!grouped[key]) {
        grouped[key] = {
          college_name: f.college_name,
          from_date: f.from_date,
          to_date: f.to_date,
          faculties: []
        };
      }

      grouped[key].faculties.push(f);
    });

    return Object.values(grouped);
  }

  /* ================= VIEW ================= */

  openFaculties(batch: any) {
    this.selectedBatch = batch;
    this.showFacultyModal = true;
  }

  closeFaculties() {
    this.showFacultyModal = false;
  }

  /* ================= DOWNLOAD ================= */

  downloadBatch(batch: any) {
    batch.faculties.forEach((f: any) => {
      window.open(`http://localhost:5055/api/certificate/generate/fdp/${f.id}`);
    });
  }

  downloadFaculty(f: any) {
    window.open(`http://localhost:5055/api/certificate/generate/fdp/${f.id}`);
  }
   /* ================= ATTENDANCE ================= */

openCalendar(faculty: any) {

  this.selectedStudent = faculty;
  this.showCalendar = true;

  this.generateDates(faculty.from_date, faculty.to_date);
  this.loadHolidays();
}

closeCalendar() {
  this.showCalendar = false;
  this.selectedStudent = null;
}


/* ================= GENERATE DATE RANGE ================= */

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


/* ================= LOAD HOLIDAYS ================= */

loadHolidays() {

  if (!this.selectedStudent) return;

  const year = new Date(this.selectedStudent.from_date).getFullYear();

  this.api.getTlHolidays(year).subscribe({
    next: (res: any[]) => {
      this.holidays = res.map(h => h.holiday_date);
    },
    error: (err) => console.error(err)
  });
}


/* ================= UI HELPERS ================= */

holidays: string[] = [];

isPresent(date: string) {
  return this.selectedStudent?.present_dates?.includes(date);
}

isHoliday(date: string) {
  return this.holidays.includes(date);
}



}