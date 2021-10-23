import { Component, OnInit, EventEmitter } from '@angular/core';
import { Observable, Subscription, combineLatest, timer, from, of } from 'rxjs';
import { switchMap, mergeMap, pluck, delay, filter, map, tap } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { FetchBasicDataService } from '../UseCases/fetch-basic-data.service';
import { SynchronizeDataService } from '../UseCases/synchronize-data.service';
import { AuthenticationService } from '../UseCases/authentication.service';
import { SyncDialogComponent } from '../sync-dialog/sync-dialog.component';
import { Bet, SeasonBet, User } from '../Businessrules/basic_datastructures';
import { SEASON, MATCHDAYS_PER_SEASON } from '../Businessrules/rule_defined_values';

const BET_FIX_CYCLE: number = 60 * 1000; // cycle time in [ms] that is used to check if Bets needs to be fixed
const SYNC_CYCLE: number = 5 * 60 * 1000; // cycle time in [ms] that is used to check if new Data to synchronize is available
const DURATION_SYNC_SNACKBAR: number = 5 * 1000; // duration in [ms] the snackbar for data sync shows up until dismissal
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  selectedPage: string;
  loggedUser: User;
  matchdayNextMatch: number;
  matchdayLastMatch: number;
  matchdayCompleted: number;
  matchdayClosestMatch: number;
  matchdayUserSelection: number;
  nextFixTimestamp: number; // next time point to check if all Bets are fixed
  betsUpdateTime: number;
  matchdaysToSync: number[];
  fixBetEvent: EventEmitter<number>;
  syncNeededEvent: EventEmitter<void>;

  constructor(
    private appData: AppdataAccessService,
    private fetchBasicService: FetchBasicDataService,
    public syncService: SynchronizeDataService,
    private authenticator: AuthenticationService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog) {

    this.loggedUser = {
      documentId: "",
      id: "",
      email: "",
      displayName: "",
      isAdmin: false,
      isActive: false
    };

    this.selectedPage = "dashboard";
    this.matchdayNextMatch = -1;
    this.matchdayLastMatch = -1;
    this.matchdayClosestMatch = -1;
    this.matchdayCompleted = -1;
    this.matchdayUserSelection = -1;
    this.nextFixTimestamp = -1;
    this.betsUpdateTime = -1;
    this.matchdaysToSync = [];
    this.fixBetEvent = new EventEmitter();
    this.syncNeededEvent = new EventEmitter();
  }

  changeView(targetPage: string): void {
    this.selectedPage = targetPage;
  }

  changeMatchdayOnUserSelection(matchday: number): void {
    this.matchdayUserSelection = matchday;
  }

  logout(): void {
    this.authenticator.logout();
  }

  openSyncDialog(): void {
    //

    let dialogRef: MatDialogRef<SyncDialogComponent> = this.dialog.open(SyncDialogComponent, { minWidth: "60vw", data: { matchdaysToSync: this.matchdaysToSync } });
    this.matchdaysToSync = [];
  }

  subscribeToSyncCheck(matchdayLastMatch: number): void {
    // if the corresponding matchday has new data to sync, it inserts the
    // matchday into the matchdaysToSync array and notifies via event

    timer(0, SYNC_CYCLE)
      .pipe(
        switchMap(() => of(matchdayLastMatch, matchdayLastMatch + 1)),
        filter((matchday: number) => matchday >= 1 && matchday <= MATCHDAYS_PER_SEASON),
        mergeMap((matchday: number) => this.syncService.isSyncNeeded$(SEASON, matchday).pipe(
          map((isNeeded: boolean) => {
            if (isNeeded) {
              return matchday;
            }
            else {
              return -1;
            }
          }),
          filter((matchday: number) => matchday > 0)
        ))
      )
      .subscribe(
        (matchdayToSync: number) => {
          if (!this.matchdaysToSync.includes(matchdayToSync)) {
            this.matchdaysToSync.push(matchdayToSync);
            this.syncNeededEvent.emit();
          }
        }
      );
  }

  setMatchdays(): void {
    // sets next and last matchday including a plausiblity check

    combineLatest(
      this.getMatchdayOfLastMatch$(),
      this.getMatchdayOfNextMatch$(),
      this.fetchBasicService.getClosestMatchday$()
    ).subscribe(
      ([matchdayLast, matchdayNext, matchdayClosest]) => {
        if (matchdayLast == -1 && matchdayNext == -1) { // no matches available
          this.matchdayLastMatch = 1;
          this.matchdayNextMatch = 1;
          this.matchdayClosestMatch = 1;
          this.matchdayCompleted = 0;
        }
        else if (matchdayLast > 0 && matchdayNext == -1) { // all matches played
          this.matchdayLastMatch = matchdayLast;
          this.matchdayNextMatch = matchdayLast;
          this.matchdayClosestMatch = matchdayLast;
          this.matchdayCompleted = matchdayLast;
        }
        else if (matchdayLast == -1 && matchdayNext > 0) { // no matches played yet
          this.matchdayLastMatch = matchdayNext;
          this.matchdayNextMatch = matchdayNext;
          this.matchdayClosestMatch = matchdayNext;
          this.matchdayCompleted = -1;
        }
        else {
          this.matchdayLastMatch = matchdayLast;
          this.matchdayNextMatch = matchdayNext;
          this.matchdayClosestMatch = matchdayClosest;
          if (matchdayNext > matchdayLast) {
            this.matchdayCompleted = matchdayLast;
          }
          else {
            this.matchdayCompleted = matchdayNext - 1;
          }
        }
      },
      err => { },
      () => {
        // once matchdays are set we can emit the event that inits the fixing
        // of Bets for the matchday of the last match. This is only called once
        // in the beginning on ngOnInit
        this.fixBetEvent.emit(this.matchdayLastMatch);
        this.subscribeToSyncCheck(this.matchdayLastMatch);
      }
    );
  }

  getMatchdayOfNextMatch$(): Observable<number> {
    // returns -1 if no matches are left in the current season (= season ended)

    return this.appData.getNextMatch$(SEASON).pipe(
      pluck("matchId"),
      switchMap((idNextMatch: number) => this.appData.getMatchdayByMatchId$(idNextMatch))
    );
  }

  getMatchdayOfLastMatch$(): Observable<number> {
    // return -1 if no matches are completed in the current season (= season not yet started)

    return this.appData.getLastMatch$(SEASON).pipe(
      pluck("matchId"),
      switchMap((idLastMatch: number) => this.appData.getMatchdayByMatchId$(idLastMatch))
    );
  }

  setNextFixTimestamp(): void {
    // retrieves the next timestamp when to check for fixing Bets and sets
    // the according property to this value

    this.fetchBasicService.fetchNextFixTime$(SEASON).subscribe(
      (nextTime: number) => {
        this.nextFixTimestamp = nextTime;
      }
    );
  }

  checkForFixingBets(): void {
    // checks each circle if Bets need to be fixed and calls the method to
    // fix bet if this is the case

    timer(0, BET_FIX_CYCLE).pipe(
      switchMap(() => this.fetchBasicService.getCurrentTimestamp$())
    ).subscribe(
      (currentTimestamp: number) => {
        if (currentTimestamp >= this.nextFixTimestamp && this.nextFixTimestamp > 0) {
          this.fixOpenOverdueBets(this.matchdayNextMatch);
          this.setNextFixTimestamp();
        }
      }
    )
  }

  fixOpenOverdueBets(matchday: number): void {
    // sets the isFixed property to true for all bets that haven't been fixed yet

    if (matchday > 0) {
      this.fetchBasicService.fetchOpenOverdueBets$(SEASON, matchday).subscribe(
        (bet: Bet) => {
          bet.isFixed = true;
          this.appData.setBet(bet);
        }
      );

      if (matchday == 1) { // no matter what match, if matchday 1 has begun, fix SeasonBets
        this.fetchBasicService.fetchOpenOverdueSeasonBets$(SEASON).subscribe(
          (seasonBet: SeasonBet) => {
            seasonBet.isFixed = true;
            this.appData.setSeasonBet(seasonBet);
          }
        );
      }

      // set new update time to trigger update in the bet-write component!
      // set operations don't need to be finished, as Bets are locked in the
      // bet-write component due to time comparison, even if a Bet is not fixed
      this.betsUpdateTime = Math.floor((new Date()).getTime() / 1000);
    }
  }

  ngOnInit(): void {

    // set logged user as property
    this.authenticator.getLoggedUser$().subscribe(
      (user: any) => {
        if (user) {
          this.appData.getUserDataById$(user.uid).subscribe(
            (userProfile: User) => {
              this.loggedUser = userProfile;
              this.loggedUser.isActive = user.emailVerified;
            }
          );
        }
      }
    );

    this.fixBetEvent.subscribe(
      (matchday: number) => this.fixOpenOverdueBets(matchday)
    );

    this.syncNeededEvent.subscribe(
      () => {
        let message: string = "Neue Daten verfügbar";
        let action: string = "abrufen";
        let config: MatSnackBarConfig<any> = {
          horizontalPosition: "center",
          verticalPosition: "bottom",
          duration: DURATION_SYNC_SNACKBAR
        };

        let syncNotificationBar: MatSnackBarRef<any> = this.snackbar.open(message, action, config);
        syncNotificationBar.onAction().subscribe(
          () => {
            this.openSyncDialog();
          }
        );
      }
    );

    this.setMatchdays();
    this.setNextFixTimestamp();
    this.checkForFixingBets();
  }
}
