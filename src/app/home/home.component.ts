import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { switchMap, pluck } from 'rxjs/operators';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { SEASON } from '../Businessrules/rule_defined_values';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  selectedPage: string;
  authId: string;
  matchdayNextMatch: number;
  matchdayLastMatch: number;
  matchdayUserSelection: number;


  constructor(private appData: AppdataAccessService) {
    this.selectedPage = "news";
    this.authId = "Mauri";
    this.matchdayNextMatch = -1;
    this.matchdayLastMatch = -1;
    this.matchdayUserSelection = -1;
    this.setMatchdays();
  }

  setMatchdays(): void {
    // sets next and last matchday including a plausiblity check

    combineLatest(this.getMatchdayOfLastMatch$(), this.getMatchdayOfNextMatch$()).subscribe(
      ([lastMatchday, nextMatchday]) => {
        if (lastMatchday == -1 && nextMatchday == -1) { // no matches available
          this.matchdayLastMatch = 1;
          this.matchdayNextMatch = 1;
        }
        else if (lastMatchday > 0 && nextMatchday == -1) { // all matches played
          this.matchdayLastMatch = lastMatchday;
          this.matchdayNextMatch = lastMatchday;
        }
        else if (lastMatchday == -1 && nextMatchday > 0) { // no matches played yet
          this.matchdayLastMatch = nextMatchday;
          this.matchdayNextMatch = nextMatchday;
        }
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

  changeMatchdayOnUserSelection(matchday: number): void {
    this.matchdayUserSelection = matchday;
  }

  changeView(targetPage: string): void {
    this.selectedPage = targetPage;
  }

  ngOnInit(): void {
  }

}
