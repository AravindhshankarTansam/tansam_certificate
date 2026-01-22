import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // ✅ ADD THIS
import { Chart, ChartOptions, ChartType } from 'chart.js/auto';
import jsPDF from 'jspdf';

interface AttendanceRecord {
  present: number;
  total: number;
}

interface Employee {
  name: string;
  title: string;
  type: string;
  attendance: Record<string, AttendanceRecord>;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule // ✅ REQUIRED for routerLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {

  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  selectedMonth: string = 'January';
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June'];

  employees: Employee[] = [
    { name: 'John Smith', title: 'Web Developer', type: 'Remote', attendance: { January: { present: 22, total: 24 }, February: { present: 20, total: 24 }, March: { present: 23, total: 24 } } },
    { name: 'Edward Pierre', title: 'QA Engineer', type: 'Onsite', attendance: { January: { present: 18, total: 24 }, February: { present: 21, total: 24 }, March: { present: 19, total: 24 } } },
    { name: 'Jennifer Anderson', title: 'Project Manager', type: 'Onsite', attendance: { January: { present: 21, total: 24 }, February: { present: 23, total: 24 }, March: { present: 22, total: 24 } } },
    { name: 'Chris Davis', title: 'Data Analyst', type: 'Remote', attendance: { January: { present: 20, total: 24 }, February: { present: 21, total: 24 }, March: { present: 22, total: 24 } } },
    { name: 'Jessica Wilson', title: 'UI/UX Designer', type: 'Onsite', attendance: { January: { present: 19, total: 24 }, February: { present: 20, total: 24 }, March: { present: 21, total: 24 } } }
  ];

  ngAfterViewInit(): void {
    this.loadPieChart();
  }

  getAttendance(emp: Employee): AttendanceRecord {
    return emp.attendance[this.selectedMonth] || { present: 0, total: 0 };
  }

  getAttendancePercentage(emp: Employee): number {
    const a = this.getAttendance(emp);
    return a.total ? Math.round((a.present / a.total) * 100) : 0;
  }

  isEligible(emp: Employee): boolean {
    return this.getAttendancePercentage(emp) >= 90;
  }

  getTodayAttendanceCount(): number {
    return this.employees.reduce((sum, emp) => sum + this.getAttendance(emp).present, 0);
  }

  getAverageAttendancePercentage(): number {
    const sum = this.employees.reduce((acc, emp) => acc + this.getAttendancePercentage(emp), 0);
    return Math.round(sum / this.employees.length);
  }

  getCertificatesCount(): number {
    return this.employees.filter(emp => this.isEligible(emp)).length;
  }

  generateCertificate(emp: Employee): void {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Certificate of Completion', 40, 30);
    doc.setFontSize(12);
    doc.text(`This certifies that`, 40, 50);
    doc.text(emp.name, 40, 60);
    doc.text(`has achieved ${this.getAttendancePercentage(emp)}% attendance.`, 40, 75);
    doc.text('Authorized by Team Lead', 40, 100);
    doc.save(`${emp.name}-certificate.pdf`);
  }

  onMonthChange(): void {
    if (this.chart) this.chart.destroy();
    this.loadPieChart();
  }

  loadPieChart(): void {
    const ctx = this.pieChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const present = this.employees.reduce((sum, emp) => sum + this.getAttendance(emp).present, 0);
    const total = this.employees.reduce((sum, emp) => sum + this.getAttendance(emp).total, 0);

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Present', 'Absent'],
        datasets: [{
          data: [present, total - present],
          backgroundColor: ['#4CAF50', '#F44336']
        }]
      },
      options: { responsive: true }
    });
  }
}
