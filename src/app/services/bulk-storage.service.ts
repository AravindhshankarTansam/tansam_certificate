import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BulkStorageService {

  private sdpBatches: any[] = [];

  /* SAVE SDP BATCH */
  addSdpBatch(batch: any) {
    this.sdpBatches.push(batch);
  }

  /* GET SDP BATCHES */
  getSdpBatches() {
    return this.sdpBatches;
  }

}
