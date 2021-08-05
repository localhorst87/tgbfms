import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { Observable, from } from 'rxjs';
import { toArray, concatMap } from 'rxjs/operators';
import { FormBuilder, FormControl } from '@angular/forms';
import { FetchBetOverviewService } from '../UseCases/fetch-bet-overview.service';
import { FetchBasicDataService } from '../UseCases/fetch-basic-data.service';
import { BetOverviewFrameData, BetOverviewUserData, SeasonBetOverviewFrameData, SeasonBetOverviewUserData } from '../UseCases/output_datastructures';
import { User } from '../Businessrules/basic_datastructures';
import { SEASON, MATCHDAYS_PER_SEASON, NUMBER_OF_TEAMS } from '../Businessrules/rule_defined_values';

@Component({
  selector: 'app-bet-overview',
  templateUrl: './bet-overview.component.html',
  styleUrls: ['./bet-overview.component.css']
})
export class BetOverviewComponent implements OnInit, OnChanges {

  @Input() userId: string;
  nTeams: number;
  frameData: BetOverviewFrameData[];
  seasonFrameData: SeasonBetOverviewFrameData[];
  betData: any; // will be a key-value pair of <matchId: number, betData: BetOverviewUserData[]>
  seasonBetDataMap: any; // will be a key-value pair of <userName: string, betData: SeasonBetOverviewUserData[]>
  seasonBetDataUserNames: string[]; // sorted list with user names of the Season Bets for iterating in template
  seasonBetData: SeasonBetOverviewUserData[][];
  isPanelExpanded: boolean;
  displayMethodForm: FormControl; // option field (matchday, duration, season)
  selectedDisplayMethod: string;
  matchdayForm: FormControl; // slider which matchday to load
  @Input() selectedMatchday: number; // (will be pre allocated with closest matchday)
  isLoading: boolean;

  constructor(
    private fetchBetService: FetchBetOverviewService,
    private fetchBasicService: FetchBasicDataService,
    private formBuilder: FormBuilder) {

    this.userId = "";
    this.nTeams = NUMBER_OF_TEAMS;
    this.frameData = [];
    this.seasonFrameData = []
    this.betData = new Map();
    this.seasonBetDataMap = new Map();
    this.seasonBetDataUserNames = [];
    this.seasonBetData = [];
    this.isPanelExpanded = false;
    this.displayMethodForm = this.formBuilder.control("matchday");
    this.selectedDisplayMethod = "matchday";
    this.matchdayForm = this.formBuilder.control(1);
    this.selectedMatchday = -1;
    this.isLoading = false;
  }

  resetData(): void {
    // resets frame and user Bet data to display

    this.frameData = [];
    this.seasonFrameData = [];
    this.seasonBetDataMap = new Map();
    this.seasonBetDataUserNames = [];
    this.seasonBetData = [];
    // no reset of Maps. Key-value pairs are just added. Saves database queries
  }

  showBetsByMatchday(matchday: number): void {
    // fills the arrays with the requested frame and user Bet data

    this.resetData();
    this.fetchBetService.fetchFrameDataByMatchday$(SEASON, matchday, this.userId).subscribe(
      (overviewFrameData: BetOverviewFrameData) => {
        this.isLoading = true;
        this.frameData.push(overviewFrameData);
        if (!this.betData.has(overviewFrameData.matchId)) {
          this.addUserBets(overviewFrameData.matchId, overviewFrameData.isBetFixed);
        }
      },
      err => {
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );

    this.isPanelExpanded = false;
    this.selectedMatchday = this.matchdayForm.value;
    this.selectedDisplayMethod = this.displayMethodForm.value;
  }

  showSeasonBets(): void {
    // fills the arrays with the season frame and user data

    this.resetData();
    this.fetchBetService.fetchSeasonFrameData$(SEASON, this.userId).subscribe(
      (overviewFrameData: SeasonBetOverviewFrameData) => {
        this.isLoading = true;
        this.seasonFrameData.push(overviewFrameData);
      },
      err => {
        this.isLoading = false;
      },
      () => {
        this.addUserSeasonBets();
        this.isLoading = false;
      }
    );

    this.isPanelExpanded = false;
    this.selectedDisplayMethod = "season";
  }

  addUserBets(matchId: number, isBetFixed: boolean): void {
    // adds all the user data

    let overviewData$: Observable<BetOverviewUserData> = isBetFixed ?
      this.fetchBetService.fetchUserBetDataByMatchday$(matchId) :
      this.fetchBetService.fetchUserBetDataByMatchday$(matchId, this.userId);

    overviewData$.pipe(toArray()).subscribe(
      (overviewUserData: BetOverviewUserData[]) => {
        this.isLoading = true;
        this.betData.set(matchId, overviewUserData);
      },
      err => {
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  addUserSeasonBets(): void {
    // adds all the user season data as two level key-value pairs: the first level
    // is the userName, the second level is the place.
    // so, this.seasonBetDataMap.get("john_doe").get(1) returns john_doe's bet for the
    // first place

    // use Observable here to make use of check if subscription has finished,
    // when transfer from Map to array starts!
    from(this.seasonFrameData).pipe(
      concatMap((frameData: SeasonBetOverviewFrameData) => {
        return (frameData.isBetFixed ?
          this.fetchBetService.fetchUserSeasonBetData$(SEASON, frameData.place) :
          this.fetchBetService.fetchUserSeasonBetData$(SEASON, frameData.place, this.userId) // else-case returns dummy bet
        );
      })
    ).subscribe(
      (overviewUserData: SeasonBetOverviewUserData) => {
        this.isLoading = true;

        if (!this.seasonBetDataMap.has(overviewUserData.userName)) {
          this.seasonBetDataMap.set(overviewUserData.userName, []); // init if user appears 1st time
        }
        let userBetArray: SeasonBetOverviewUserData[] = this.seasonBetDataMap.get(overviewUserData.userName);
        userBetArray.push(overviewUserData);
        this.seasonBetDataMap.set(overviewUserData.userName, userBetArray);
      },
      err => {
        this.isLoading = false;
      },
      () => {
        this.seasonBetMapToArrays(); // after Map has finished collecting values, transfer values to arrays
        this.isLoading = false;
      }
    )
  }

  seasonBetMapToArrays(): void {
    // transfers the Map values to arrays for error-resistant iterating in template
    // sorts the arrays according to the place order from first to last place

    for (let userBetsEntry of this.seasonBetDataMap.entries()) {
      this.seasonBetDataUserNames.push(userBetsEntry[0]); // [0] denotes the key
      this.seasonBetData.push(userBetsEntry[1]); // [1] denotes the value
    }
    this.sortSeasonBetArray();
  }

  sortSeasonBetArray(): void {
    // sorts the SeasonBetOverviewUserData from first to last place

    for (let i = 0; i < this.seasonBetData.length; i++) {
      this.seasonBetData[i].sort(this.comparePlaces);
    }
  }

  comparePlaces(a: SeasonBetOverviewUserData, b: SeasonBetOverviewUserData) {
    // compare function to sort places from first to last place

    let placeA: number = a.place < 0 ? a.place + NUMBER_OF_TEAMS + 1 : a.place;
    let placeB: number = b.place < 0 ? b.place + NUMBER_OF_TEAMS + 1 : b.place;
    return placeA - placeB;
  }


  ngOnInit(): void { }

  ngOnChanges(): void {
    if (this.selectedMatchday > 0) {
      this.matchdayForm.setValue(this.selectedMatchday);
      this.showBetsByMatchday(this.selectedMatchday);
    }
  }

}
