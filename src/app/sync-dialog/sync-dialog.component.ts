import { Component, Inject } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { SynchronizeDataService, REQUIRED_UPDATES_PER_MATCHDAY } from '../UseCases/synchronize-data.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SEASON } from '../Businessrules/rule_defined_values';

@Component({
  selector: 'app-sync-dialog',
  templateUrl: './sync-dialog.component.html',
  styleUrls: ['./sync-dialog.component.css']
})
export class SyncDialogComponent {

  updateCounter: number;
  nRequiredUpdates: number;
  progress: number;
  isSynchronizing: boolean;

  constructor(
    private dialogRef: MatDialogRef<SyncDialogComponent>,
    private syncService: SynchronizeDataService,
    @Inject(MAT_DIALOG_DATA) private data: { matchdaysToSync: number[] }) {
    this.updateCounter = 0;
    this.nRequiredUpdates = 0;
    this.progress = 0;
    this.isSynchronizing = false;
  }

  startSync(): void {
    //

    this.isSynchronizing = true;

    let nMatchdaysToSync: number = this.data.matchdaysToSync.length;
    this.nRequiredUpdates = nMatchdaysToSync * REQUIRED_UPDATES_PER_MATCHDAY;
    this.updateCounter = 0;

    let progressSubscription: Subscription = this.syncService.counterEvent.subscribe(
      () => {
        this.updateCounter++;
        this.progress = this.nRequiredUpdates > 0 ? Math.round(100 * this.updateCounter / this.nRequiredUpdates) : 0;
        if (this.updateCounter == this.nRequiredUpdates) {
          this.dialogRef.close();
          this.isSynchronizing = false;
          progressSubscription.unsubscribe();
        }
      }
    );

    let syncSubscription: Subscription = timer(0, 2500).subscribe(
      (i: number) => {
        let matchdayToSync: number = this.data.matchdaysToSync[i];
        this.syncService.syncData(SEASON, matchdayToSync);
        if (i == this.data.matchdaysToSync.length - 1) {
          syncSubscription.unsubscribe();
        }
      }
    );
  }
}
