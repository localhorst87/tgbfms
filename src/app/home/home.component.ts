import { Component, OnInit, EventEmitter, Renderer2 } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { combineLatest, timer, of } from 'rxjs';
import { switchMap, delay } from 'rxjs/operators';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { FetchBasicDataService } from '../UseCases/fetch-basic-data.service';
import { SynchronizeDataService } from '../UseCases/synchronize-data.service';
import { AuthenticationService } from '../UseCases/authentication.service';
import { Bet, SeasonBet, User } from '../Businessrules/basic_datastructures';
import { SEASON } from '../Businessrules/rule_defined_values';

const BET_FIX_CYCLE: number = 1 * 60 * 1000; // cycle time in [ms] that is used to check if Bets needs to be fixed

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
  matchdayCurrent: number;
  matchdayClosestMatch: number;
  matchdayUserSelection: number;
  matchdayTopMatchSync: number;
  nextFixTimestamp: number; // next time point to check if all Bets are fixed
  betsUpdateTime: number;
  matchdaysToSync: number[];
  applyDarkTheme: FormControl;
  fixBetEvent: EventEmitter<number>;

  constructor(
    private appData: AppdataAccessService,
    private fetchBasicService: FetchBasicDataService,
    public syncService: SynchronizeDataService,
    private authenticator: AuthenticationService,
    private renderer: Renderer2,
    private formBuilder: FormBuilder) {

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
    this.matchdayCurrent = -1;
    this.matchdayUserSelection = -1;
    this.matchdayTopMatchSync = -1;
    this.nextFixTimestamp = -1;
    this.betsUpdateTime = -1;
    this.matchdaysToSync = [];
    this.applyDarkTheme = this.formBuilder.control(false);
    this.fixBetEvent = new EventEmitter();
  }

  switchTheme(): void {
    if (this.applyDarkTheme.value) {
      this.renderer.addClass(document.body, 'theme-dark');
    }
    else {
      this.renderer.removeClass(document.body, 'theme-dark');
    }
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

    combineLatest(
      this.fetchBasicService.getMatchdayOfLastMatch$(),
      this.fetchBasicService.getMatchdayOfNextMatch$(),
      this.fetchBasicService.getClosestMatchday$(),
      this.fetchBasicService.getCurrentMatchday$(SEASON),
      this.fetchBasicService.getFinishedMatchday$(SEASON)
    ).subscribe(
      ([matchdayLast, matchdayNext, matchdayClosest, matchdayCurrent, matchdayFinished]) => {
        if (matchdayLast == -1 && matchdayNext == -1) { // no matches available
          this.matchdayLastMatch = 1;
          this.matchdayNextMatch = 1;
          this.matchdayClosestMatch = 1;
          this.matchdayCurrent = 1;
          this.matchdayCompleted = 0;
        }
        else if (matchdayLast > 0 && matchdayNext == -1) { // all matches played
          this.matchdayLastMatch = matchdayLast;
          this.matchdayNextMatch = matchdayLast;
          this.matchdayClosestMatch = matchdayLast;
          this.matchdayCurrent = matchdayLast;
          this.matchdayCompleted = matchdayLast;
        }
        else if (matchdayLast == -1 && matchdayNext > 0) { // no matches played yet
          this.matchdayLastMatch = matchdayNext;
          this.matchdayNextMatch = matchdayNext;
          this.matchdayClosestMatch = matchdayNext;
          this.matchdayCurrent = matchdayNext;
          this.matchdayCompleted = 0;
        }
        else {
          this.matchdayLastMatch = matchdayLast;
          this.matchdayNextMatch = matchdayNext;
          this.matchdayClosestMatch = matchdayClosest;
          this.matchdayCurrent = matchdayCurrent;
          this.matchdayCompleted = matchdayFinished;
        }
      },
      err => { },
      () => {
        // once matchdays are set we can emit the event that inits the fixing
        // of Bets for the matchday of the last match. This is only called once
        // in the beginning on ngOnInit
        this.fixBetEvent.emit(this.matchdayLastMatch);
      }
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
      delay(2000),
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

    // fix overdue bets
    this.fixBetEvent.subscribe(
      (matchday: number) => this.fixOpenOverdueBets(matchday)
    );

    this.setMatchdays();
    this.setNextFixTimestamp();
    this.checkForFixingBets();
  }
}
