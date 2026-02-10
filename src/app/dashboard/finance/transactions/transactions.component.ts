import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { TransactionsFdpComponent } from './transactions-fdp/transactions-fdp.component';
import { TransactionsSdpComponent } from './transactions-sdp/transactions-sdp.component';
import { TransactionsIndustryComponent } from './transactions-industry/transactions-industry.component';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent implements OnInit {
  sdpStudents: any[] = [];
  fdpStaff: any[] = [];
  industryStaff: any[] = [];

  isFinance = localStorage.getItem('role') === 'FINANCE';

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadAll();
  }

  /* ================= LOAD DATA ================= */

loadAll() {
  this.api.getFinanceSDP().subscribe(res =>
    this.sdpStudents = this.prepare(res)
  );

  this.api.getFinanceFDP().subscribe(res =>
    this.fdpStaff = this.prepare(res)
  );

  this.api.getFinanceIndustry().subscribe(res =>
    this.industryStaff = this.prepare(res)
  );
}


  /* ================= ADD UI FIELDS ================= */

  prepare(data: any[]) {
    return data.map(r => ({
      ...r,
      isEdit: false
    }));
  }

  /* ================= EDIT ================= */

  edit(row: any) {
    row.isEdit = true;
  }

  cancel(row: any) {
    row.isEdit = false;
  }

  /* ================= SAVE PAYMENT ================= */

  save(row: any, type: 'sdp' | 'fdp' | 'industry') {

    if (!row.payment_mode || !row.amount || !row.payment_date) {
      this.toast.show('Fill all required fields', 'error');
      return;
    }

    if (!row.transaction_id) {
      this.toast.show('Reference / Cheque number required', 'error');
      return;
    }

    const payload = {
      payment_mode: row.payment_mode,
      amount: row.amount,
      transaction_id: row.transaction_id,
      payment_date: row.payment_date
    };

    this.api.updatePayment(type, row.id, payload).subscribe({
      next: () => {
        row.isEdit = false;
        row.paid_status = true;
        this.toast.show('Payment saved', 'success');
      },
      error: () => {
        this.toast.show('Failed to save', 'error');
      }
    });
  }
}
