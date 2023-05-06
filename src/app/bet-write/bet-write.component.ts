import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { FetchBetWriteDataService } from '../UseCases/fetch-bet-write-data.service';
import { FetchBasicDataService } from '../UseCases/fetch-basic-data.service';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { interval } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { Bet, SeasonBet, Team, TopMatchVote } from '../Businessrules/basic_datastructures';
import { BetWriteData, SeasonBetWriteData } from '../UseCases/output_datastructures';
import { SEASON, MATCHDAYS_PER_SEASON, NUMBER_OF_TEAMS } from '../Businessrules/rule_defined_values';

const INTERVAL_TIME_REFRESH: number = 1 * 1000; // 1 sec
const MATCHDAY_BEGUN_TOLERANCE: number = -60 * 60 // (seconds)

@Component({
  selector: 'app-bet-write',
  templateUrl: './bet-write.component.html',
  styleUrls: ['./bet-write.component.css']
})
export class BetWriteComponent implements OnInit, OnChanges {

  @Input() userId: string;
  currentSeason: string; // current season name, e.g. "2021/2022"
  nTeams: number; // total number of teams in the campaign
  nMatchdays: number; // total number of matchdays per season
  currentTime: Date;
  activeTeams: Team[]; // all active teams in this campaign
  matches: BetWriteData[]; // loaded matches to bet
  seasonBets: SeasonBetWriteData[]; // loaded season bets
  isPanelExpanded: boolean;
  displayMethodForm: FormControl; // option field (matchday, duration, season)
  selectedDisplayMethod: string; // identifier of selected option
  matchdayForm: FormControl; // slider which matchday to load
  @Input() selectedMatchday: number; // (will be pre allocated with next matchday)
  @Output() selectMatchdayEvent = new EventEmitter<number>(); // directs selected matchday to home component
  betForm: FormGroup; // formular for setting bets
  seasonBetForm: FormGroup; // formular for setting season bets
  votedTopMatch: number; // for selected matchday
  selectedMatchdayHasBegun: boolean;
  precedingMatchdayIsFinished: boolean; // w.r.t. selected matchday
  isLoading: boolean;

  constructor(
    private fetchBetService: FetchBetWriteDataService,
    private fetchBasicService: FetchBasicDataService,
    private appData: AppdataAccessService,
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar) {

    this.userId = "";
    this.currentSeason = String(SEASON) + "/" + String(SEASON + 1);
    this.nTeams = NUMBER_OF_TEAMS;
    this.nMatchdays = MATCHDAYS_PER_SEASON;
    this.currentTime = new Date();
    this.selectedMatchday = -1;
    this.matches = [];
    this.seasonBets = [];
    this.betForm = this.formBuilder.group({
      bets: this.formBuilder.array([])
    });
    this.seasonBetForm = this.formBuilder.group({
      places: this.formBuilder.array([])
    });
    this.displayMethodForm = this.formBuilder.control("matchday");
    this.isPanelExpanded = false;
    this.selectedDisplayMethod = "matchday";
    this.matchdayForm = this.formBuilder.control(1);
    this.activeTeams = [];
    this.fetchBasicService.fetchActiveTeams$(SEASON).subscribe(
      (team: Team) => this.activeTeams.push(team)
    );
    this.votedTopMatch = -1;
    this.selectedMatchdayHasBegun = false;
    this.precedingMatchdayIsFinished = false;
    this.isLoading = false;
  }

  get bets() {
    return this.betForm.get('bets') as FormArray;
  }

  get places() {
    return this.seasonBetForm.get('places') as FormArray;
  }

  resetData(): void {
    this.currentTime = new Date();
    this.matches = [];
    this.seasonBets = [];
    this.betForm = this.formBuilder.group({
      bets: this.formBuilder.array([])
    });
    this.seasonBetForm = this.formBuilder.group({
      places: this.formBuilder.array([])
    });
  }

  showMatchesByMatchday(matchday: number): void {
    this.resetData();
    this.isLoading = true;

    this.fetchBetService.fetchDataByMatchday$(SEASON, matchday, this.userId).subscribe(
      (betData: BetWriteData) => {
        this.matches.push(betData);
        this.addMatchForm(betData);
      },
      err => {
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );

    // check if selected matchday has begun
    this.fetchBasicService.matchdayHasBegun$(SEASON, matchday, MATCHDAY_BEGUN_TOLERANCE).subscribe(
      (isUnderway: boolean) => {
        this.selectedMatchdayHasBegun = isUnderway;
      }
    );

    // check if preceding matchday (w.r.t. selected matchday) is finished
    if (matchday > 1) {
      this.fetchBasicService.matchdayIsFinished$(SEASON, matchday - 1).subscribe(
        (isFinished: boolean) => {
          this.precedingMatchdayIsFinished = isFinished;
        }
      );
    }
    else {
      this.precedingMatchdayIsFinished = true;
    }

    // check if TopMatchVote is existing for this matchday, if yes, set the according matchId
    this.votedTopMatch = -1; // reset first
    this.appData.getTopMatchVotes$(SEASON, matchday, this.userId).subscribe(
      (vote: TopMatchVote) => {
        this.votedTopMatch = vote.matchId; // will be invoked only, if a vote is available!
      }
    );

    this.isPanelExpanded = false;
    this.selectedMatchday = this.matchdayForm.value;
    this.selectMatchdayEvent.emit(this.matchdayForm.value);
    this.selectedDisplayMethod = "matchday";
  }

  showSeasonBets(): void {
    this.resetData();
    this.isLoading = true;

    this.fetchBetService.fetchSeasonData$(SEASON, this.userId).subscribe(
      (betData: SeasonBetWriteData) => {
        this.seasonBets.push(betData);
        this.addSeasonBetForm(betData);
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

  addMatchForm(betWriteData: BetWriteData): void {
    // adds the BetWriteData to the Form

    let matchForm: FormGroup = this.formBuilder.group({
      betHome: [{ value: betWriteData.betGoalsHome < 0 ? null : betWriteData.betGoalsHome, disabled: betWriteData.isBetFixed || this.currentTime > betWriteData.matchDate }, Validators.min(0)],
      betAway: [{ value: betWriteData.betGoalsAway < 0 ? null : betWriteData.betGoalsAway, disabled: betWriteData.isBetFixed || this.currentTime > betWriteData.matchDate }, Validators.min(0)]
    });

    this.subscribeCorrectingBetValues(matchForm);
    this.subscribeToBetChanges(matchForm, betWriteData);
    this.bets.push(matchForm);
  }

  subscribeToBetChanges(form: FormGroup, betData: BetWriteData): void {
    // refreshes the Bet in the App Database upon checking the values

    form.valueChanges.subscribe(value => {

      let updatedBet: Bet = {
        documentId: betData.betDocumentId,
        matchId: betData.matchId,
        userId: this.userId,
        isFixed: betData.isBetFixed,
        goalsHome: value.betHome,
        goalsAway: value.betAway
      };

      if (this.isBetFormFilled(form)) {
        this.appData.setBet(updatedBet)
          .then(() => {
            let confirmMessage: string = String(value.betHome) + ":" + String(value.betAway) + " eingetragen";
            this.snackbar.open(confirmMessage, "", { verticalPosition: "top", duration: 800 });
          });
      }
    });
  }

  isBetFormFilled(form: FormGroup): boolean {
    // checks if home AND away fields are filled

    return form.controls.betHome.value != null && form.controls.betAway.value != null;
  }

  subscribeCorrectingBetValues(form: FormGroup): void {
    // corrects any invalid value to zero

    form.controls.betHome.statusChanges.subscribe(status => {
      if (status == "INVALID") {
        form.controls.betHome.setValue(0);
      }
    });

    form.controls.betAway.statusChanges.subscribe(status => {
      if (status == "INVALID") {
        form.controls.betAway.setValue(0);
      }
    });
  }

  addSeasonBetForm(seasonBetWriteData: SeasonBetWriteData): void {
    // is adding SeasonBetWriteData to the Form

    let placeForm: FormControl = this.formBuilder.control({ value: String(seasonBetWriteData.teamId), disabled: seasonBetWriteData.isBetFixed || this.currentTime > seasonBetWriteData.dueDate });

    this.subscribeToSeasonBetChanges(placeForm, seasonBetWriteData);
    this.places.push(placeForm);
  }

  subscribeToSeasonBetChanges(form: FormControl, seasonData: SeasonBetWriteData): void {
    // refreshes the SeasonBet in the App Database upon checking the values

    form.valueChanges.subscribe(value => {
      if (this.isSeasonBetSelectionValid() && value != undefined) {
        let updatedBet: SeasonBet = {
          documentId: seasonData.betDocumentId,
          season: seasonData.season,
          userId: this.userId,
          isFixed: seasonData.isBetFixed,
          place: seasonData.place,
          teamId: Number(value)
        };
        this.appData.setSeasonBet(updatedBet);
      }
      else {
        form.setValue("-1");
      }
    });
  }

  isSeasonBetSelectionValid(): boolean {
    // returns true/false upon valid/invalid selection of a team
    // (checks if the team has already been selected elsewhere)

    let selectedTeams: number[] = [];

    for (let formControl of this.places.controls) { // collect all selected teamIds, if valid
      if (formControl.value != undefined) {
        let teamId: number = Number(formControl.value);

        if (teamId > 0) {
          selectedTeams.push(teamId);
        }
      }
    }

    let uniqueTeams: number[] = selectedTeams.filter((val, idx, arr) => arr.indexOf(val) === idx);

    if (selectedTeams.length > uniqueTeams.length) { // at least one team ID is selected twice!
      return false;
    }
    else {
      return true;
    }
  }

  lockBet(iBet: number): void {
    // locks the bet in the App database

    let form: FormGroup = <FormGroup>this.bets.controls[iBet];

    let updatedBet: Bet = {
      documentId: this.matches[iBet].betDocumentId,
      matchId: this.matches[iBet].matchId,
      userId: this.userId,
      isFixed: true,
      goalsHome: form.controls.betHome.value,
      goalsAway: form.controls.betAway.value
    };

    if (this.isBetFormFilled(form)) {
      this.appData.setBet(updatedBet); // updated in App Database
      this.matches[iBet].isBetFixed = true; // refreshes BetWriteData
      this.bets.controls[iBet].disable(); // disable input form
    }
  }

  lockSeasonBet(iBet: number): void {
    // lock the SeasonBet in the App Database

    let form: FormControl = <FormControl>this.places.controls[iBet];
    let newTeamId: number;

    if (form.value == undefined) {
      newTeamId = -1;
    }
    else {
      newTeamId = Number(form.value);
    }

    if (newTeamId > 0) {
      let updatedBet: SeasonBet = {
        documentId: this.seasonBets[iBet].betDocumentId,
        season: this.seasonBets[iBet].season,
        userId: this.userId,
        isFixed: true,
        place: this.seasonBets[iBet].place,
        teamId: newTeamId
      };
      this.appData.setSeasonBet(updatedBet);
      this.seasonBets[iBet].isBetFixed = true;
      this.places.controls[iBet].disable();
    }
  }

  voteTopMatch(matchday: number, matchId: number): void {
    // sets the TopMatchVote with the given matchId

    let vote: TopMatchVote = {
      documentId: this.appData.createDocumentId(),
      season: SEASON,
      matchday: matchday,
      matchId: matchId,
      userId: this.userId,
      timestamp: this.currentTime.getTime() / 1000 // no floor, due to precision
    };

    this.appData.setTopMatchVote(vote)
      .then(() => {
        let confirmMessage: string = "Topspiel-Vote eingetragen";
        this.snackbar.open(confirmMessage, "", { verticalPosition: "top", duration: 1000 });
        this.votedTopMatch = vote.matchId;
      });
  }

  ngOnInit(): void {
    // refresh current time
    interval(INTERVAL_TIME_REFRESH).subscribe(
      val => {
        this.currentTime = new Date();
        // if a matchday is selected and bets are loaded, check if a kickoff is now
        // if yes => refresh the view, to disable the input field 
        if (this.selectedMatchday > 0 && this.matches.length > 0) {
          const matchTimestamps: number[] = this.matches
            .map(betWriteData => betWriteData.matchDate)
            .map(matchDate => Math.floor(matchDate.getTime() / 1000));
          const timestampNow = Math.floor(this.currentTime.getTime() / 1000);

          // refresh view if one of the timestamps of the matches is reached
          if (matchTimestamps.some(matchTimestamp => matchTimestamp == timestampNow))
            this.showMatchesByMatchday(this.selectedMatchday);
        }
      }
    );
  }

  ngOnChanges(): void {
    if (this.selectedMatchday > 0) {
      this.matchdayForm.setValue(this.selectedMatchday);
      this.showMatchesByMatchday(this.selectedMatchday);
    }
  }

}
