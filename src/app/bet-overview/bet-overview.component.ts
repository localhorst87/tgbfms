import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { interval } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { FormBuilder, FormControl } from '@angular/forms';
import { FetchBetOverviewService } from '../UseCases/fetch-bet-overview.service';
import { FetchBasicDataService } from '../UseCases/fetch-basic-data.service';
import { BetOverviewFrameData, BetOverviewUserData, SeasonBetOverviewFrameData, SeasonBetOverviewUserData } from '../UseCases/output_datastructures';
import { SEASON, MATCHDAYS_PER_SEASON, NUMBER_OF_TEAMS } from '../Businessrules/rule_defined_values';

const INTERVAL_TIME_REFRESH: number = 1 * 1000; // 1 sec

@Component({
  selector: 'app-bet-overview',
  templateUrl: './bet-overview.component.html',
  styleUrls: ['./bet-overview.component.css']
})
export class BetOverviewComponent implements OnInit, OnChanges {

  @Input() userId: string;
  @Input() matchdayCompleted: number;
  currentTime: Date;
  nTeams: number;
  nMatchdays: number;
  currentSeason: string;
  frameData: BetOverviewFrameData[];
  seasonFrameData: SeasonBetOverviewFrameData[];
  betData: any; // will be a key-value pair of <matchId: number, betData: BetOverviewUserData[]>
  seasonBetData: any; // will be a key-value pair of <userName: string, betData: SeasonBetOverviewUserData[]>
  isPanelExpanded: boolean;
  displayMethodForm: FormControl; // option field (matchday, duration, season)
  selectedDisplayMethod: string;
  matchdayForm: FormControl; // slider which matchday to load
  enableAutoClose: FormControl; // assigned to slider-toggle
  highlightResults: FormControl; // assigned to slider-toggle
  @Input() selectedMatchday: number; // (will be pre allocated with closest matchday)
  isLoading: boolean;
  isLoadingBets: boolean;
  dummyNames: string[];

  constructor(
    private fetchBetService: FetchBetOverviewService,
    private fetchBasicService: FetchBasicDataService,
    private formBuilder: FormBuilder) {

    this.userId = "";
    this.matchdayCompleted = -1;
    this.currentTime = new Date();
    this.nTeams = NUMBER_OF_TEAMS;
    this.nMatchdays = MATCHDAYS_PER_SEASON;
    this.currentSeason = String(SEASON) + "/" + String(SEASON + 1);
    this.frameData = [];
    this.seasonFrameData = []
    this.betData = new Map();
    this.seasonBetData = new Map();
    this.isPanelExpanded = false;
    this.displayMethodForm = this.formBuilder.control("matchday");
    this.selectedDisplayMethod = "matchday";
    this.matchdayForm = this.formBuilder.control(1);
    this.enableAutoClose = this.formBuilder.control(true);
    this.highlightResults = this.formBuilder.control(false);
    this.selectedMatchday = -1;
    this.isLoading = false;
    this.isLoadingBets = false;
    this.dummyNames = [
      "Dortmund",
      "Schalke",
      "Bayern",
      "Werder",
      "Frankfurt",
      "Wolfsburg",
      "Leipzig",
      "Hannover",
      "Nürnberg",
      "Leverkusen",
      "Gladbach",
      "Hamburg",
      "Pauli",
      "Stuttgart",
      "Mainz",
      "Augsburg",
      "Berlin",
      "Bochum"
    ];
  }

  resetData(): void {
    // resets frame and user Bet data to display

    this.currentTime = new Date();
    this.frameData = [];
    this.seasonFrameData = [];
    this.seasonBetData = new Map();
    // no reset of Maps. Key-value pairs are just added. Saves database queries
  }

  addFrameData(matchday: number): void {
    // fills the arrays with the requested frame and user Bet data

    this.resetData();
    this.fetchBetService.fetchFrameDataByMatchday$(SEASON, matchday, this.userId).subscribe(
      (overviewFrameData: BetOverviewFrameData) => {
        this.isLoading = true;
        this.frameData.push(overviewFrameData);
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
    this.selectedDisplayMethod = "matchday";
  }

  addSeasonFrameData(): void {
    // fills the arrays with the season frame data
    this.isLoading = true;

    this.resetData();
    this.fetchBetService.fetchSeasonFrameData$(SEASON, this.userId).subscribe(
      (overviewFrameData: SeasonBetOverviewFrameData) => {
        this.seasonFrameData.push(overviewFrameData);
      },
      err => {
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );

    this.isPanelExpanded = false;
    this.selectedDisplayMethod = "season";
  }

  addUserBets(matchId: number): void {
    // adds all the user data

    // do nothing in case data is already loaded
    if (this.betData.has(matchId)) {
      return;
    }

    this.isLoadingBets = true;

    this.fetchBetService.fetchUserBetDataByMatchday$(matchId).pipe(toArray()).subscribe(
      (overviewUserData: BetOverviewUserData[]) => {
        this.betData.set(matchId, overviewUserData);
      },
      err => {
        this.isLoadingBets = false;
      },
      () => {
        this.isLoadingBets = false;
      }
    );
  }

  addUserSeasonBets(place: number): void {
    // adds all the user season data as key-value pairs

    // do nothing in case data is already loaded
    if (this.seasonBetData.has(place)) {
      return;
    }

    this.isLoadingBets = true;

    this.fetchBetService.fetchUserSeasonBetData$(SEASON, place).pipe(toArray()).subscribe(
      (overviewUserData: SeasonBetOverviewUserData[]) => {
        this.seasonBetData.set(place, overviewUserData); // init if user appears 1st time
      },
      err => {
        this.isLoadingBets = false;
      },
      () => {
        this.isLoadingBets = false;
      }
    )
  }

  isBetWrong(bet: BetOverviewUserData, result: BetOverviewFrameData) {
    // checks if the Bet is worth 0 points, in case result is available

    if (result.resultGoalsHome == -1 && result.resultGoalsAway == -1) {
      return false;
    }

    return !this.fetchBasicService.isBetCorrect(bet.betGoalsHome, bet.betGoalsAway, result.resultGoalsHome, result.resultGoalsAway);
  }

  ngOnInit(): void {
    // refresh current time
    interval(INTERVAL_TIME_REFRESH).subscribe(
      val => {
        this.currentTime = new Date();
      }
    );
  }

  ngOnChanges(): void {
    if (this.selectedMatchday > 0 && this.matchdayCompleted != -1) {
      this.matchdayForm.setValue(this.selectedMatchday);
      this.addFrameData(this.selectedMatchday);
    }
  }

}
