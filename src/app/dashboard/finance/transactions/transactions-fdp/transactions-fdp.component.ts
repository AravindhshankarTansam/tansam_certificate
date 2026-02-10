import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-transactions-fdp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions-fdp.component.html',
  styleUrl: './transactions-fdp.component.css'
})
export class TransactionsFdpComponent implements OnInit {

  rows: any[] = [];
  isFinance = localStorage.getItem('role') === 'FINANCE';

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getFinanceFDP().subscribe(res => {
      this.rows = res.map(r => ({ ...r, isEdit: false }));
    });
  }

  edit(r:any){ r.isEdit = true; }
  cancel(r:any){ r.isEdit = false; }

save(r: any) {

  if (!r.payment_mode || !r.amount || !r.payment_date) {
    this.toast.show('Fill all fields', 'error');
    return;
  }

  if (!r.transaction_id) {
    this.toast.show('Reference / Cheque number required', 'error');
    return;
  }

  const payload = {
    payment_mode: r.payment_mode,
    amount: r.amount,
    transaction_id: r.transaction_id,
    payment_date: r.payment_date
  };

  this.api.updatePayment('fdp', r.id, payload)
    .subscribe(() => {
      r.isEdit = false;
      r.paid_status = true;
      this.toast.show('Payment saved', 'success');
    });
}

}
