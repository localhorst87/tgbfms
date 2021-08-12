import { Component, OnInit, EventEmitter } from '@angular/core';
import { Observable, combineLatest, interval } from 'rxjs';
import { switchMap, pluck } from 'rxjs/operators';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { FetchBasicDataService } from '../UseCases/fetch-basic-data.service';
import { SynchronizeDataService } from '../UseCases/synchronize-data.service';
import { AuthenticationService } from '../UseCases/authentication.service';
import { Bet, SeasonBet, User } from '../Businessrules/basic_datastructures';
import { SEASON, MATCHDAYS_PER_SEASON } from '../Businessrules/rule_defined_values';

const BET_FIX_CYCLE: number = 60 * 1000; // cycle time in [ms] that is used to check if Bets needs to be fixed

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
  matchdayUserSelection: number;
  nextFixTimestamp: number; // next time point to check if all Bets are fixed
  betsUpdateTime: number;
  fixBetEvent: EventEmitter<number>;
  syncDataEvent: EventEmitter<void>;

  constructor(
    private appData: AppdataAccessService,
    private fetchBasicService: FetchBasicDataService,
    private syncService: SynchronizeDataService,
    private authenticator: AuthenticationService) {

    this.loggedUser = {
      documentId: "",
      id: "",
      email: "",
      displayName: "",
      isAdmin: false,
      isActive: false
    };

    this.selectedPage = "write";
    this.matchdayNextMatch = -1;
    this.matchdayLastMatch = -1;
    this.matchdayUserSelection = -1;
    this.nextFixTimestamp = -1;
    this.betsUpdateTime = -1;
    this.fixBetEvent = new EventEmitter();
    this.syncDataEvent = new EventEmitter();
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

  setMatchdays(): void {
    // sets next and last matchday including a plausiblity check

    combineLatest(this.getMatchdayOfLastMatch$(), this.getMatchdayOfNextMatch$()).subscribe(
      ([matchdayLast, matchdayNext]) => {
        if (matchdayLast == -1 && matchdayNext == -1) { // no matches available
          this.matchdayLastMatch = 1;
          this.matchdayNextMatch = 1;
        }
        else if (matchdayLast > 0 && matchdayNext == -1) { // all matches played
          this.matchdayLastMatch = 1; //matchdayLast;
          this.matchdayNextMatch = matchdayLast;
        }
        else if (matchdayLast == -1 && matchdayNext > 0) { // no matches played yet
          this.matchdayLastMatch = 1; //matchdayNext;
          this.matchdayNextMatch = matchdayNext;
        }
        else {
          this.matchdayLastMatch = 1; //matchdayLast;
          this.matchdayNextMatch = matchdayNext;
        }
      },
      err => { },
      () => {
        // once matchdays are set we can emit the event that inits the fixing
        // of Bets for the matchday of the last match. This is only called once
        // in the beginning on ngOnInit
        this.fixBetEvent.emit(this.matchdayLastMatch);
        this.syncDataEvent.emit();
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

    interval(BET_FIX_CYCLE).pipe(
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
            console.log(seasonBet);
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

    this.syncDataEvent.subscribe(
      () => {
        let currentMatchday: number = this.matchdayLastMatch;

        if (currentMatchday > 0) {
          // use timer to avoid errors in retrieving data due to parallel read
          // operations this usually happens on unexpected high loads on read
          // operations in Firestore
          let timerSubsc = interval(2500).subscribe(
            i => {
              // start with last completed matchday
              let matchdayToSync: number = currentMatchday + i - 1;

              if (matchdayToSync >= 1 && matchdayToSync <= MATCHDAYS_PER_SEASON) {
                this.syncService.syncData(SEASON, matchdayToSync);
              }

              // end with next matchday
              if (i == 2) {
                timerSubsc.unsubscribe();
              }
            }
          );
        }
      }
    );

    this.setMatchdays();
    this.setNextFixTimestamp();
    this.checkForFixingBets();
  }
}
