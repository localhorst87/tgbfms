import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { FetchTableService } from '../UseCases/fetch-table.service';
import { StatisticsCalculatorService } from '../Businessrules/statistics-calculator.service';
import { TableData } from '../UseCases/output_datastructures';
import { SEASON, MATCHDAYS_PER_SEASON, NUMBER_OF_TEAMS } from '../Businessrules/rule_defined_values';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  @Input() userId: string;
  @Input() currentMatchday: number;
  nMatchdays: number;
  selectedStartMatchday: number;
  selectedEndMatchday: number;
  includeSeasonBets: FormControl;
  isPanelExpanded: boolean;
  matchdayStartForm: FormControl; // slider that indicates the start matchday of the calculation
  matchdayEndForm: FormControl; // slider that indicates the end matchday of the calculation
  @ViewChild("allMatchdays") tableAllMatchdays!: MatTable<TableData>;
  @ViewChild("matchday") tableMatchday!: MatTable<TableData>;
  // @ViewChild('allMatchdays', { read: MatSort, static: true }) sortAll!: MatSort;
  tableDataAllMatchdays: TableData[];
  tableDataMatchday: TableData[];
  propertiesDefault: string[];
  propertiesIncludeSeason: string[];
  propertiesToDisplay: string[];
  tablesLoaded: number;

  constructor(
    private fetchService: FetchTableService,
    private formBuilder: FormBuilder,
    private statCalc: StatisticsCalculatorService) {
    this.userId = "";
    this.currentMatchday = -1;
    this.nMatchdays = MATCHDAYS_PER_SEASON;
    this.selectedStartMatchday = -1;
    this.selectedEndMatchday = -1;
    this.includeSeasonBets = this.formBuilder.control(false);
    this.isPanelExpanded = false;
    this.matchdayStartForm = this.formBuilder.control(1);
    this.matchdayEndForm = this.formBuilder.control(1);
    this.tableDataAllMatchdays = [];
    this.tableDataMatchday = [];
    this.propertiesDefault = ["place", "userName", "points", "matches", "results", "extraTop", "extraOutsider"];
    this.propertiesIncludeSeason = ["place", "userName", "points", "matches", "results", "extraTop", "extraOutsider", "extraSeason"];
    this.propertiesToDisplay = this.propertiesDefault;
    this.tablesLoaded = 0;
    this.subscribeCorrectingSliders();
  }

  sortNew(sortState: Sort): void {

    if (sortState.active == "matches") {
      if (sortState.direction == "desc") {
        this.tableDataAllMatchdays.sort((a, b) => b.matches - a.matches);
      }
      else if (sortState.direction == "asc") {
        this.tableDataAllMatchdays.sort((a, b) => a.matches - b.matches);
      }
      else {
        this.tableDataAllMatchdays.sort(this.statCalc.compareScores);
      }
    }
    else if (sortState.active == "results") {
      if (sortState.direction == "desc") {
        this.tableDataAllMatchdays.sort((a, b) => b.results - a.results);
      }
      else if (sortState.direction == "asc") {
        this.tableDataAllMatchdays.sort((a, b) => a.results - b.results);
      }
      else {
        this.tableDataAllMatchdays.sort(this.statCalc.compareScores);
      }
    }
    else if (sortState.active == "extraTop") {
      if (sortState.direction == "desc") {
        this.tableDataAllMatchdays.sort((a, b) => b.extraTop - a.extraTop);
      }
      else if (sortState.direction == "asc") {
        this.tableDataAllMatchdays.sort((a, b) => a.extraTop - b.extraTop);
      }
      else {
        this.tableDataAllMatchdays.sort(this.statCalc.compareScores);
      }
    }
    else if (sortState.active == "extraOutsider") {
      if (sortState.direction == "desc") {
        this.tableDataAllMatchdays.sort((a, b) => b.extraOutsider - a.extraOutsider);
      }
      else if (sortState.direction == "asc") {
        this.tableDataAllMatchdays.sort((a, b) => a.extraOutsider - b.extraOutsider);
      }
      else {
        this.tableDataAllMatchdays.sort(this.statCalc.compareScores);
      }
    }
    else if (sortState.active == "extraSeason") {
      if (sortState.direction == "desc") {
        this.tableDataAllMatchdays.sort((a, b) => b.extraSeason - a.extraSeason);
      }
      else if (sortState.direction == "asc") {
        this.tableDataAllMatchdays.sort((a, b) => a.extraSeason - b.extraSeason);
      }
      else {
        this.tableDataAllMatchdays.sort(this.statCalc.compareScores);
      }
    }
    else {
      this.tableDataAllMatchdays.sort(this.statCalc.compareScores);
    }

    this.tableAllMatchdays.renderRows();
    return;
  }

  adjustProperties(): void {
    if (this.includeSeasonBets.value) {
      this.propertiesToDisplay = this.propertiesIncludeSeason;
    } else {
      this.propertiesToDisplay = this.propertiesDefault;
    }
  }

  showTable(startMatchday: number, endMatchday: number): void {
    // fill the table with new data according to the given matchdays and
    // renders the data!

    this.tablesLoaded = 0;
    let newTableData: TableData[] = [];
    let newTableDataMatchday: TableData[] = [];

    let matchdays: number[] = this.createMatchdayArray(startMatchday, endMatchday);
    this.fetchService.fetchTableByMatchdays$(SEASON, matchdays, this.includeSeasonBets.value).subscribe(
      (tableDataset: TableData) => { newTableData.push(tableDataset); },
      err => { },
      () => {
        this.tableDataAllMatchdays = newTableData;
        this.tableAllMatchdays.renderRows();
        this.tablesLoaded++;
      }
    );

    this.fetchService.fetchTableByMatchdays$(SEASON, [endMatchday]).subscribe(
      (tableDataset: TableData) => { newTableDataMatchday.push(tableDataset); },
      err => { },
      () => {
        this.tableDataMatchday = newTableDataMatchday;
        this.tableMatchday.renderRows();
        this.tablesLoaded++;
      }
    );

    this.selectedStartMatchday = startMatchday;
    this.selectedEndMatchday = endMatchday;
    this.isPanelExpanded = false;
  }

  setSliders(startMatchday: number, endMatchday: number): void {
    // sets the sliders to the given values after limiting the values

    if (startMatchday > this.currentMatchday) {
      return;
    }

    startMatchday = Math.min(Math.max(1, startMatchday), this.currentMatchday);
    endMatchday = Math.min(Math.max(1, endMatchday), this.currentMatchday);

    this.matchdayStartForm.setValue(startMatchday)
    this.matchdayEndForm.setValue(endMatchday);
  }

  subscribeCorrectingSliders(): void {
    // starts the subscription for plausibility check and correction of the
    // slider start and end value

    this.matchdayStartForm.valueChanges.subscribe(newStartValue => {
      if (newStartValue > this.currentMatchday) {
        this.matchdayStartForm.setValue(this.currentMatchday);
      }
      if (newStartValue > this.matchdayEndForm.value) {
        this.matchdayStartForm.setValue(this.matchdayEndForm.value)
      }
    });

    this.matchdayEndForm.valueChanges.subscribe(newEndValue => {
      if (newEndValue > this.currentMatchday) {
        this.matchdayEndForm.setValue(this.currentMatchday);
      }
      if (newEndValue < this.matchdayStartForm.value) {
        this.matchdayEndForm.setValue(this.matchdayStartForm.value)
      }
    });
  }

  private createMatchdayArray(startMatchday: number, endMatchday: number): number[] {
    // helper function to create a range array from startMatchday to endMatchday

    let nMatchdays: number = endMatchday - startMatchday + 1;
    if (nMatchdays < 1) {
      return [];
    }

    let mArray: number[] = [];
    for (let matchday = startMatchday; matchday <= endMatchday; matchday++) {
      mArray.push(matchday);
    }
    return mArray;
  }

  ngOnInit(): void {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  ngOnChanges(): void {
    if (this.currentMatchday > 0) {
      this.matchdayEndForm.setValue(this.currentMatchday);
      this.showTable(1, this.currentMatchday);
    }
  }

}
