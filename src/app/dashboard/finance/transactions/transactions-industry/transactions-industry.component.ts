import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-transactions-industry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions-industry.component.html',
  styleUrl: './transactions-industry.component.css'
})
export class TransactionsIndustryComponent implements OnInit {

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
    this.api.getFinanceIndustry().subscribe(res => {
      this.rows = res.map(r => ({ ...r, isEdit: false }));
    });
  }

  edit(r:any){ r.isEdit = true; }
  cancel(r:any){ r.isEdit = false; }

  save(r:any){

    if(!r.payment_mode || !r.amount || !r.payment_date){
      this.toast.show('Fill all fields','error');
      return;
    }

    const payload = {
      payment_mode: r.payment_mode,
      amount: r.amount,
      transaction_id: r.transaction_id,
      payment_date: r.payment_date
    };

    this.api.updatePayment('industry', r.id, payload)
      .subscribe(() => {
        r.isEdit = false;
        r.paid_status = true;
        this.toast.show('Payment saved','success');
      });
  }
}
