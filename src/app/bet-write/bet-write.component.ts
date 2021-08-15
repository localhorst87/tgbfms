import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { FetchBetWriteDataService } from '../UseCases/fetch-bet-write-data.service';
import { FetchBasicDataService } from '../UseCases/fetch-basic-data.service';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { Bet, SeasonBet, Team } from '../Businessrules/basic_datastructures';
import { BetWriteData, SeasonBetWriteData } from '../UseCases/output_datastructures';
import { SEASON, MATCHDAYS_PER_SEASON, NUMBER_OF_TEAMS } from '../Businessrules/rule_defined_values';

@Component({
  selector: 'app-bet-write',
  templateUrl: './bet-write.component.html',
  styleUrls: ['./bet-write.component.css']
})
export class BetWriteComponent implements OnInit, OnChanges {

  @Input() userId: string;
  @Input() lastUpdateTime: number;
  nTeams: number; // total number of teams in the campaign
  nMatchdays: number; // total number of matchdays per season
  currentDate: Date;
  activeTeams: Team[]; // all active teams in this campaign
  matches: BetWriteData[]; // loaded matches to bet
  seasonBets: SeasonBetWriteData[]; // loaded season bets
  isPanelExpanded: boolean;
  displayMethodForm: FormControl; // option field (matchday, duration, season)
  selectedDisplayMethod: string; // identifier of selected option
  matchdayForm: FormControl; // slider which matchday to load
  @Input() selectedMatchday: number; // (will be pre allocated with next matchday)
  @Output() selectMatchdayEvent = new EventEmitter<number>(); // directs selected matchday to home component
  durationForm: FormControl; // slider of future days matches to load
  selectedDuration: number; // pre allocated with 7 days
  betForm: FormGroup; // formular for setting bets
  seasonBetForm: FormGroup; // formular for setting season bets

  constructor(
    private fetchBetService: FetchBetWriteDataService,
    private fetchBasicService: FetchBasicDataService,
    private appData: AppdataAccessService,
    private formBuilder: FormBuilder) {

    this.userId = "";
    this.lastUpdateTime = -1;
    this.nTeams = NUMBER_OF_TEAMS;
    this.nMatchdays = MATCHDAYS_PER_SEASON;
    this.currentDate = new Date();
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
    this.selectedDuration = 7;
    this.durationForm = this.formBuilder.control(this.selectedDuration);
    this.activeTeams = [];
    this.fetchBasicService.fetchActiveTeams$(SEASON).subscribe(
      (team: Team) => this.activeTeams.push(team)
    );
  }

  get bets() {
    return this.betForm.get('bets') as FormArray;
  }

  get places() {
    return this.seasonBetForm.get('places') as FormArray;
  }

  resetData(): void {
    this.currentDate = new Date();
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
    this.fetchBetService.fetchDataByMatchday$(SEASON, matchday, this.userId).subscribe(
      (betData: BetWriteData) => {
        this.matches.push(betData);
        this.addMatchForm(betData);
      }
    );
    this.isPanelExpanded = false;
    this.selectedMatchday = this.matchdayForm.value;
    this.selectMatchdayEvent.emit(this.matchdayForm.value);
    this.selectedDisplayMethod = this.displayMethodForm.value;
  }

  showMatchesByDuration(days: number): void {
    this.resetData();
    this.fetchBetService.fetchDataByTime$(days, this.userId).subscribe(
      (betData: BetWriteData) => {
        this.matches.push(betData);
        this.addMatchForm(betData);
      }
    );
    this.isPanelExpanded = false;
    this.selectedDuration = this.durationForm.value;
    this.selectedDisplayMethod = this.displayMethodForm.value;
  }

  showSeasonBets(): void {
    this.resetData();
    this.fetchBetService.fetchSeasonData$(SEASON, this.userId).subscribe(
      (betData: SeasonBetWriteData) => {
        this.seasonBets.push(betData);
        this.addSeasonBetForm(betData);
      }
    );

    this.isPanelExpanded = false;
    this.selectedDisplayMethod = "season";
  }

  addMatchForm(betWriteData: BetWriteData): void {
    // adds the BetWriteData to the Form

    let matchForm: FormGroup = this.formBuilder.group({
      betHome: [{ value: betWriteData.betGoalsHome < 0 ? null : betWriteData.betGoalsHome, disabled: betWriteData.isBetFixed || this.currentDate > betWriteData.matchDate }, Validators.min(0)],
      betAway: [{ value: betWriteData.betGoalsAway < 0 ? null : betWriteData.betGoalsAway, disabled: betWriteData.isBetFixed || this.currentDate > betWriteData.matchDate }, Validators.min(0)]
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
        this.appData.setBet(updatedBet);
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

    let placeForm: FormControl = this.formBuilder.control({ value: String(seasonBetWriteData.teamId), disabled: seasonBetWriteData.isBetFixed || this.currentDate > seasonBetWriteData.dueDate });

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

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.selectedMatchday > 0 || this.lastUpdateTime > 0) {
      this.matchdayForm.setValue(this.selectedMatchday);
      this.showMatchesByMatchday(this.selectedMatchday);
    }
  }

}
