import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-industry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './industry.component.html',
  styleUrls: ['./industry.component.css']
})
export class IndustryComponent implements OnInit {

  list: any[] = [];
  labs: any[] = [];

  showModal = false;
  editingId: number | null = null;

  form: any = this.emptyForm();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
    this.loadLabs();
  }

  emptyForm() {
    return {
      industry_staff_name: '',
      industry_staff_id: '',
      industry_name: '',
      designation_name: '',
      phone: '',
      email: '',
      lab_id: '',
      from_date: '',
      to_date: ''
    };
  }

  load() {
    this.api.getIndustry().subscribe((res: any[]) => this.list = res);
  }

  loadLabs() {
    this.api.getLabs().subscribe(res => this.labs = res);
  }

  openModal(data?: any) {
    this.showModal = true;

    if (data) {
      this.form = { ...data };
      this.editingId = data.id;
    } else {
      this.form = this.emptyForm();
      this.editingId = null;
    }
  }

  closeModal() {
    this.showModal = false;
    this.form = this.emptyForm();
    this.editingId = null;
  }

  save() {
    if (this.editingId) {
      this.api.updateIndustry(this.editingId, this.form).subscribe(() => {
        this.closeModal();
        this.load();
      });
    } else {
      this.api.addIndustry(this.form).subscribe(() => {
        this.closeModal();
        this.load();
      });
    }
  }
}
