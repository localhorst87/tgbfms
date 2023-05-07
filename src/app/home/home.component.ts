import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { FetchBasicDataService } from '../UseCases/fetch-basic-data.service';
import { AuthenticationService } from '../UseCases/authentication.service';
import { User } from '../Businessrules/basic_datastructures';
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
  matchdaysToSync: number[];
  applyDarkTheme: FormControl;

  constructor(
    private appData: AppdataAccessService,
    private fetchBasicService: FetchBasicDataService,
    private authenticator: AuthenticationService,
    private renderer: Renderer2,
    private formBuilder: FormBuilder) {

    this.loggedUser = {
      documentId: "",
      id: "",
      email: "",
      displayName: "",
      isAdmin: false,
      isActive: false,
      configs: {
        theme: "light",
        notificationLevel: 0,
        notificationTime: 1
      }
    };

    this.selectedPage = "dashboard";
    this.matchdayNextMatch = -1;
    this.matchdayLastMatch = -1;
    this.matchdayClosestMatch = -1;
    this.matchdayCompleted = -1;
    this.matchdayCurrent = -1;
    this.matchdayUserSelection = -1;
    this.matchdaysToSync = [];
    this.applyDarkTheme = this.formBuilder.control(false);
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

  updateUser(user: User): void {
    this.loggedUser = user;
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
      });
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
              // switch to default theme from user config
              this.applyDarkTheme.setValue(this.loggedUser.configs.theme == "dark");
              this.switchTheme();
            }
          );
        }
      }
    );

    this.setMatchdays();
  }
}
