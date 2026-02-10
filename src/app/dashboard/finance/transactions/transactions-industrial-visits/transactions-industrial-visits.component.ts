import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { ToastService } from '../../../../services/toast.service';


@Component({
  standalone: true,
  selector: 'app-transactions-industrial-visits',
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions-industrial-visits.component.html',
  styleUrls: ['./transactions-industrial-visits.component.css']
})
export class TransactionsIndustrialVisitsComponent implements OnInit {

  visits: any[] = [];
  isEditing?: boolean


  constructor(
  private api: ApiService,
  private toast: ToastService
) {}


  ngOnInit() {
    this.load();
  }

load() {
  this.api.getIVVisits().subscribe({
    next: (res: any[]) => {
      this.visits = res.map(v => ({
        ...v,
        isEditing: false   // 🔒 locked by default
      }));
    },
    error: () => {
      this.toast.show('Failed to load visits', 'error');
    }
  });
}

edit(v: any) {
  v.isEditing = true;
}

save(v: any) {

  if (!v.payment_mode || !v.amount) {
    this.toast.show('Fill all fields', 'error');
    return;
  }

  if (!v.transaction_id) {
    this.toast.show('Reference / Cheque number required', 'error');
    return;
  }

  this.api.updateIVPayment(v.id, v).subscribe({
    next: () => {
      v.isEditing = false;
      v.paid_status = true;
      this.toast.show('Payment saved successfully', 'success');
    },
    error: () => {
      this.toast.show('Payment update failed', 'error');
    }
  });
}



}
