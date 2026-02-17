import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from '@angular/material/icon';
import { BulkStorageService } from '../../../../services/bulk-storage.service';


@Component({
  selector: "app-tl-sdp-bulk-upload",
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: "./tl-sdpbulkupload.component.html",
  styleUrls: ["./tl-sdpbulkupload.component.css"]
})
export class TlSdpBulkUploadComponent implements OnInit {

  batches: any[] = [];

  showStudentsModal = false;
  selectedBatch: any = null;

  showCalendar = false;
  selectedStudent: any = null;

  calendarDays: string[] = [];

  constructor(private bulkStorage: BulkStorageService) {}

  ngOnInit(): void {
    this.loadBatches();
  }

  /* LOAD FROM SHARED STORAGE */
  loadBatches() {
    this.batches = this.bulkStorage.getSdpBatches();
  }

  openStudents(batch: any) {
    this.selectedBatch = batch;
    this.showStudentsModal = true;
  }

  closeStudents() {
    this.showStudentsModal = false;
  }

  downloadBatch(batch: any) {
    alert("Download all certificates (frontend only demo)");
  }

  downloadStudent(student: any) {
    alert("Download certificate for: " + student.student_name);
  }

  openCalendar(student: any) {
    this.selectedStudent = student;
    this.showCalendar = true;
    this.generateDates(student.from_date, student.to_date);
  }

  closeCalendar() {
    this.showCalendar = false;
  }

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

  isPresent(date: string) {
    return this.selectedStudent?.present_dates?.includes(date);
  }

  toggleDate(date: string) {

    if (!this.selectedStudent) return;

    if (!this.selectedStudent.present_dates) {
      this.selectedStudent.present_dates = [];
    }

    const list = this.selectedStudent.present_dates;

    if (list.includes(date)) {
      this.selectedStudent.present_dates =
        list.filter((d: string) => d !== date);
    } else {
      list.push(date);
    }

  }

}
