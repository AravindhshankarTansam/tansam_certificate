import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BulkStorageService {

  private sdpBatches: any[] = [];
 private fdpBatches: any[] = [];
  private industryBatches: any[] = [];

  /* SAVE SDP BATCH */
  addSdpBatch(batch: any) {
    this.sdpBatches.push(batch);
  }

  /* GET SDP BATCHES */
  getSdpBatches() {
    return this.sdpBatches;
  }
  
  /* ================= FDP ================= */


  addFdpBatch(batch: any) {
    this.fdpBatches.push(batch);
  }

  getFdpBatches() {
    return this.fdpBatches;
  }
    /* ================= INDUSTRY ================= */
  setIndustryBatch(batch: any) {
    this.industryBatches.push(batch);
  }

  getIndustryBatches() {
    return this.industryBatches;
  }

}
