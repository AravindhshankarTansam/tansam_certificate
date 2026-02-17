import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { BulkStorageService } from '../../../../services/bulk-storage.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tl-fdp-bulk-upload',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './tl-fdpbulkupload.component.html',
  styleUrls: ['./tl-fdpbulkupload.component.css']
})
export class TlFdpBulkUploadComponent implements OnInit {

  batches: any[] = [];

  showFacultyModal = false;
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
    this.batches = this.bulkStorage.getFdpBatches();
  }

  /* OPEN MODAL */
  openFaculties(batch: any) {
    this.selectedBatch = batch;
    this.showFacultyModal = true;
  }

  closeFaculties() {
    this.showFacultyModal = false;
    this.selectedBatch = null;
  }

  /* DOWNLOAD */
  downloadBatch(batch: any) {
    alert("Download all FDP certificates (frontend demo)");
  }

  downloadFaculty(f: any) {
    alert("Download certificate for: " + f.staff_name);
  }

  /* ATTENDANCE */
  openCalendar(faculty: any) {
    this.selectedStudent = faculty;
    this.showCalendar = true;
    this.generateDates(faculty.from_date, faculty.to_date);
  }

  closeCalendar() {
    this.showCalendar = false;
    this.selectedStudent = null;
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
