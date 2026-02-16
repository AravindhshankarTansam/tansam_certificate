import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-transactions-sdp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions-sdp.component.html',
  styleUrls: ['./transactions-sdp.component.css']
})
export class TransactionsSdpComponent implements OnInit {

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
    this.api.getFinanceSDP().subscribe({
      next: (res) => {
        this.rows = res.map(r => ({
          ...r,
          isEdit: false,
          submitted: false
        }));
      },
      error: () => {
        this.toast.show('Failed to load transactions', 'error');
      }
    });
  }

  startEdit(row: any) {
    row.isEdit = true;
    row.submitted = false;
  }

  cancel(row: any) {
    row.isEdit = false;
    row.submitted = false;
    // Optionally reload or revert changes if needed
  }

isRowValid(row: any): boolean {

  if (!row.payment_mode || !row.amount || !row.transaction_id || !row.payment_date) {
    return false;
  }

  const txn = row.transaction_id.trim();

  switch (row.payment_mode) {

    case 'CHEQUE':
      // exactly 6 digits
      return /^[0-9]{6}$/.test(txn);

    case 'RTGS':
    case 'NEFT':
      // 12 to 22 alphanumeric
      return /^[A-Za-z0-9]{12,22}$/.test(txn);

    case 'UPI':
      // must contain @ (basic UPI pattern)
      return /^[\w.-]+@[\w.-]+$/.test(txn);

    default:
      return false;
  }
}
isTxnValid(row: any): boolean {
  if (!row.transaction_id) return false;

  const txn = row.transaction_id.trim();

  switch (row.payment_mode) {

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


save(row: any) {
  row.submitted = true;

  if (!this.isRowValid(row)) {
    this.showToast('Please fix validation errors', 'error');
    return;
  }

  const payload = {
    payment_mode: row.payment_mode,
    amount: Number(row.amount),
    transaction_id: row.transaction_id.trim(),
    payment_date: row.payment_date
  };

  this.api.updatePayment('sdp', row.id, payload).subscribe({
    next: () => {
      row.isEdit = false;
      row.submitted = false;
      row.paid_status = true;
      this.showToast('Payment updated successfully', 'success');
    },
    error: () => {
      this.showToast('Failed to update payment', 'error');
    }
  });
}


  // Optional: visual feedback for different modes
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

  onModeChange(row: any) {
    // Can be used later for dynamic placeholder logic if needed
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