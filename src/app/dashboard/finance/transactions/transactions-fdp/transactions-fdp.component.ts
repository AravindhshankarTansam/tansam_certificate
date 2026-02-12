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
  toastMessage: string = '';
  toastType: 'success' | 'info' | 'error' = 'success';


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
    this.showToast('Please fill all required fields', 'error');
    return;
  }

  if (!r.transaction_id) {
    this.showToast('Reference / Cheque number required', 'error');
    return;
  }

  const payload = {
    payment_mode: r.payment_mode,
    amount: Number(r.amount),
    transaction_id: r.transaction_id.trim(),
    payment_date: r.payment_date
  };

  this.api.updatePayment('fdp', r.id, payload)
    .subscribe({
      next: () => {
        r.isEdit = false;
        r.paid_status = true;
        this.showToast('Payment updated successfully', 'success');
      },
      error: () => {
        this.showToast('Failed to update payment', 'error');
      }
    });
}
getModeClass(mode: string): string {
  if (!mode) return '';

  const map: Record<string, string> = {
    RTGS: 'badge-rtgs',
    NEFT: 'badge-neft',
    CHEQUE: 'badge-cheque',
    UPI: 'badge-upi'
  };

  return map[mode] || '';
}


private showToast(
  message: string,
  type: 'success' | 'info' | 'error' = 'success'
) {
  this.toastMessage = message;
  this.toastType = type;

  setTimeout(() => {
    this.toastMessage = '';
  }, 3000);
}


}
