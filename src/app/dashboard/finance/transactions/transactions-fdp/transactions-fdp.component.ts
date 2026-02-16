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

  r.submitted = true;

  if (!r.payment_mode || !r.amount || !r.payment_date) {
    this.showToast('Please fill all required fields', 'error');
    return;
  }

  if (!this.isTxnValid(r)) {
    this.showToast('Please fix transaction validation errors', 'error');
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
        r.submitted = false;
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
isTxnValid(r: any): boolean {

  if (!r.transaction_id) return false;

  const txn = r.transaction_id.trim();

  switch (r.payment_mode) {

    case 'CHEQUE':
      return /^[0-9]{6}$/.test(txn);

    case 'RTGS':
    case 'NEFT':
      return /^[A-Za-z0-9]{12,22}$/.test(txn);

    case 'UPI':
      return /^[\w.-]+@[\w.-]+$/.test(txn);

    default:
      return false;
  }
}
getTxnPlaceholder(mode: string): string {
  switch (mode) {
    case 'CHEQUE':
      return 'Enter 6 digit cheque number';
    case 'RTGS':
      return 'Enter RTGS reference (12-22 chars)';
    case 'NEFT':
      return 'Enter NEFT reference (12-22 chars)';
    case 'UPI':
      return 'example@upi';
    default:
      return 'Reference No';
  }
}
getTxnError(mode: string): string {
  switch (mode) {
    case 'CHEQUE':
      return 'Cheque number must be exactly 6 digits';
    case 'RTGS':
      return 'RTGS reference must be 12–22 alphanumeric characters';
    case 'NEFT':
      return 'NEFT reference must be 12–22 alphanumeric characters';
    case 'UPI':
      return 'UPI ID must contain @ (example@upi)';
    default:
      return 'Invalid reference number';
  }
}




}
