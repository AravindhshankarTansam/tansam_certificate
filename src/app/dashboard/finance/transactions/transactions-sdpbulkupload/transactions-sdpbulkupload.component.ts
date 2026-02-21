import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../../../services/api.service";
import { ToastService } from "../../../../services/toast.service";

@Component({
  selector: "app-transactions-sdp-bulk-upload",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./transactions-sdpbulkupload.component.html",
  styleUrls: ["./transactions-sdpbulkupload.component.css"]
})
export class TransactionsSdpBulkUploadComponent implements OnInit {

  batches: any[] = [];

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  /* ================= LOAD BATCHES ================= */
  load() {
    this.api.getBulkSdpBatches().subscribe({
      next: (res: any[]) => {
        this.batches = res.map(b => ({
          ...b,
          isEditing: false
        }));
      },
      error: () => {
        this.toast.show("Failed to load SDP batches", "error");
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

    this.api.updateBulkSdpPayment(batch.id, payload).subscribe({
      next: () => {
        batch.isEditing = false;
        batch.paid_status = 1;
        this.toast.show("Payment updated successfully", "success");
      },
      error: () => {
        this.toast.show("Payment update failed", "error");
      }
    });
  }
}
