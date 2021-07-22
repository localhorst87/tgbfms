import { Component, OnInit, Input } from '@angular/core';
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
export class BetWriteComponent implements OnInit {

  @Input() userId: string;
  nTeams: number;
  matchdayForm: FormControl;
  durationForm: FormControl;
  matches: BetWriteData[];
  seasonBets: SeasonBetWriteData[];
  dForm: FormGroup;
  seasonBetForm: FormGroup;
  displayMethodForm: FormControl;
  isPanelExpanded: boolean;
  selectedDisplayMethod: string;
  selectedMatchday: number;
  selectedDuration: number;
  activeTeams: Team[];

  constructor(
    private fetchBetService: FetchBetWriteDataService,
    private fetchBasicService: FetchBasicDataService,
    private acc: AppdataAccessService,
    private fb: FormBuilder) {

    this.userId = "";
    this.nTeams = NUMBER_OF_TEAMS;
    this.matches = [];
    this.seasonBets = [];
    this.dForm = this.fb.group({
      bets: this.fb.array([])
    });
    this.seasonBetForm = this.fb.group({
      places: this.fb.array([])
    });
    this.displayMethodForm = this.fb.control("matchday");
    this.isPanelExpanded = false;
    this.selectedDisplayMethod = "matchday";
    this.selectedMatchday = 1;
    this.matchdayForm = this.fb.control(this.selectedMatchday);
    this.selectedDuration = 7;
    this.durationForm = this.fb.control(this.selectedDuration);
    this.activeTeams = [];
    this.fetchBasicService.fetchActiveTeams$(SEASON).subscribe(
      (team: Team) => this.activeTeams.push(team)
    );
  }

  resetData(): void {
    this.matches = [];
    this.seasonBets = [];
    this.dForm = this.fb.group({
      bets: this.fb.array([])
    });
    this.seasonBetForm = this.fb.group({
      places: this.fb.array([])
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

  get bets() {
    return this.dForm.get('bets') as FormArray;
  }

  get places() {
    return this.seasonBetForm.get('places') as FormArray;
  }

  addMatchForm(betWriteData: BetWriteData): void {
    // adds the BetWriteData to the Form

    let matchForm: FormGroup = this.fb.group({
      betHome: [{ value: betWriteData.betGoalsHome < 0 ? '' : betWriteData.betGoalsHome, disabled: betWriteData.isBetFixed }, Validators.min(0)],
      betAway: [{ value: betWriteData.betGoalsAway < 0 ? '' : betWriteData.betGoalsAway, disabled: betWriteData.isBetFixed }, Validators.min(0)]
    });

    this.subscribeCorrectingValues(matchForm);
    this.subscribeToChanges(matchForm, betWriteData);
    this.bets.push(matchForm);
  }

  subscribeToChanges(form: FormGroup, betData: BetWriteData) {
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

      if (this.isFormFilled(form)) {
        this.acc.setBet(updatedBet);
      }
    });
  }

  isFormFilled(form: FormGroup): boolean {
    // checks if home AND away fields are filled

    return form.controls.betHome.value != null && form.controls.betAway.value != null;
  }

  subscribeCorrectingValues(form: FormGroup): void {
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

    if (this.isFormFilled(form)) {
      this.acc.setBet(updatedBet); // updated in App Database
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
      this.acc.setSeasonBet(updatedBet);
      this.seasonBets[iBet].isBetFixed = true;
      this.places.controls[iBet].disable();
    }
  }

  addSeasonBetForm(seasonBetWriteData: SeasonBetWriteData): void {
    // is adding SeasonBetWriteData to the Form

    let placeForm: FormControl = this.fb.control({ value: String(seasonBetWriteData.teamId), disabled: seasonBetWriteData.isBetFixed });

    placeForm.valueChanges.subscribe(value => {
      if (this.isSeasonBetSelectionValid() && value != undefined) {
        let updatedBet: SeasonBet = {
          documentId: seasonBetWriteData.betDocumentId,
          season: seasonBetWriteData.season,
          userId: this.userId,
          isFixed: seasonBetWriteData.isBetFixed,
          place: seasonBetWriteData.place,
          teamId: Number(value)
        };
        this.acc.setSeasonBet(updatedBet);
      }
      else {
        placeForm.setValue("-1");
      }
    });

    this.places.push(placeForm);
  }

  ngOnInit(): void {
  }

}
