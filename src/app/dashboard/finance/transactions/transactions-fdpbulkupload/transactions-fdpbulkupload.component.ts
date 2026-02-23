import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../../../services/api.service";
import { ToastService } from "../../../../services/toast.service";

@Component({
  selector: "app-transactions-fdp-bulk-upload",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./transactions-fdpbulkupload.component.html",
  styleUrls: ["./transactions-fdpbulkupload.component.css"]
})
export class TransactionsFdpBulkUploadComponent implements OnInit {

  batches: any[] = [];

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  /* ================= LOAD FDP BATCHES ================= */
  load() {
    this.api.getBulkFdpBatches().subscribe({
      next: (res: any[]) => {
        this.batches = res.map(b => ({
          ...b,
          isEditing: false
        }));
      },
      error: () => {
        this.toast.show("Failed to load FDP batches", "error");
      }
    });
  }

  /* ================= EDIT ================= */
  edit(batch: any) {
    batch.isEditing = true;
  }

  cancel(batch: any) {
    batch.isEditing = false;
  }

  /* ================= SAVE PAYMENT ================= */
  save(batch: any) {

    if (!batch.payment_mode || !batch.amount) {
      this.toast.show("Fill all required fields", "error");
      return;
    }

    if (!batch.transaction_id) {
      this.toast.show("Transaction / Reference number required", "error");
      return;
    }

    const payload = {
      payment_mode: batch.payment_mode,
      amount: Number(batch.amount),
      transaction_id: batch.transaction_id,
      payment_date: batch.payment_date,
      received_by: batch.received_by
    };

    this.api.updateBulkFdpPayment(batch.id, payload).subscribe({
      next: () => {
        batch.isEditing = false;
        batch.paid_status = 1;
        this.toast.show("FDP Payment updated successfully", "success");
      },
      error: () => {
        this.toast.show("Payment update failed", "error");
      }
    });
  }
}
