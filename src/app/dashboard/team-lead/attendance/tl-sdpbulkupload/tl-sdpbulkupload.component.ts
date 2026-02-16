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

  /* ================= RAW STUDENTS FROM DB ================= */
  students: any[] = [];

  /* ================= GROUPED BATCHES ================= */
  batches: any[] = [];

  /* ================= MODALS ================= */
  showStudentsModal = false;
  selectedBatch: any = null;

  showCalendar = false;
  selectedStudent: any = null;

  calendarDays: string[] = [];

  constructor(private api: ApiService) {}

  /* =========================================================
     LOAD STUDENTS FROM DB
  ========================================================= */
  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents() {
    this.api.getTlSDP().subscribe((res: any[]) => {
      this.students = res;
      this.groupBatches();
    });
  }

  /* =========================================================
     GROUP BY COLLEGE + FROM + TO  (BATCH LOGIC)
  ========================================================= */
  groupBatches() {

    const map = new Map();

    this.students.forEach((s: any) => {

      const key = `${s.college_name}_${s.from_date}_${s.to_date}`;

      if (!map.has(key)) {
        map.set(key, {
          college_name: s.college_name,
          from_date: s.from_date,
          to_date: s.to_date,
          students: []
        });
      }

      map.get(key).students.push(s);

    });

    this.batches = Array.from(map.values());
  }

  /* =========================================================
     OPEN STUDENT LIST MODAL
  ========================================================= */
  openStudents(batch: any) {
    this.selectedBatch = batch;
    this.showStudentsModal = true;
  }

  closeStudents() {
    this.showStudentsModal = false;
  }

  /* =========================================================
     DOWNLOAD FULL BATCH CERTIFICATES
  ========================================================= */
  downloadBatch(batch: any) {

    batch.students.forEach((s: any) => {
      window.open(
        `http://localhost:5055/api/certificate/generate/sdp/${s.id}`
      );
    });

  }

  /* =========================================================
     DOWNLOAD SINGLE CERTIFICATE
  ========================================================= */
  downloadStudent(student: any) {

    window.open(
      `http://localhost:5055/api/certificate/generate/sdp/${student.id}`
    );

  }

  /* =========================================================
     OPEN ATTENDANCE CALENDAR
  ========================================================= */
  openCalendar(student: any) {

    this.selectedStudent = student;
    this.showCalendar = true;

    this.generateDates(student.from_date, student.to_date);
  }

  closeCalendar() {
    this.showCalendar = false;
  }

  /* =========================================================
     GENERATE DATE RANGE
  ========================================================= */
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

  /* =========================================================
     ATTENDANCE HELPERS
  ========================================================= */
  isPresent(date: string) {
    return this.selectedStudent?.present_dates?.includes(date);
  }

  toggleDate(date: string) {

    if (!this.selectedStudent) return;

    const list = this.selectedStudent.present_dates || [];

    if (list.includes(date)) {
      this.selectedStudent.present_dates =
        list.filter((d: string) => d !== date);
    } else {
      list.push(date);
    }

    /* call backend to update */
    this.api.markTlSDPDate(this.selectedStudent.id, date).subscribe();
  }

}
