import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { FetchTableService } from '../UseCases/fetch-table.service';
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
  isPanelExpanded: boolean;
  matchdayStartForm: FormControl; // slider that indicates the start matchday of the calculation
  matchdayEndForm: FormControl; // slider that indicates the end matchday of the calculation
  @ViewChild("allMatchdays") tableAllMatchdays!: MatTable<TableData>;
  @ViewChild("matchday") tableMatchday!: MatTable<TableData>;
  tableDataAllMatchdays: TableData[];
  tableDataMatchday: TableData[];
  propertiesToDisplay: string[];

  constructor(
    private fetchService: FetchTableService,
    private formBuilder: FormBuilder) {
    this.userId = "";
    this.currentMatchday = -1;
    this.nMatchdays = MATCHDAYS_PER_SEASON;
    this.selectedStartMatchday = -1;
    this.selectedEndMatchday = -1;
    this.isPanelExpanded = false;
    this.matchdayStartForm = this.formBuilder.control(1);
    this.matchdayEndForm = this.formBuilder.control(1);
    this.tableDataAllMatchdays = [];
    this.tableDataMatchday = [];
    this.propertiesToDisplay = ["place", "userName", "points", "matches", "results", "extraTop", "extraOutsider"];
    this.subscribeCorrectingSliders();
  }

  resetData(): void {
    //

    this.tableDataAllMatchdays = [];
    this.tableDataMatchday = [];
  }

  showTable(startMatchday: number, endMatchday: number): void {
    //

    this.resetData();

    let matchdays: number[] = this.createMatchdayArray(startMatchday, endMatchday);
    this.fetchService.fetchTableByMatchdays$(SEASON, matchdays).subscribe(
      (tableDataset: TableData) => { this.tableDataAllMatchdays.push(tableDataset); },
      err => { },
      () => {
        this.tableAllMatchdays.renderRows();
      }
    );

    this.fetchService.fetchTableByMatchdays$(SEASON, [endMatchday]).subscribe(
      (tableDataset: TableData) => { this.tableDataMatchday.push(tableDataset); },
      err => { },
      () => {
        this.tableMatchday.renderRows();
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
  }

  ngOnChanges(): void {
    if (this.currentMatchday > 0) {
      this.matchdayEndForm.setValue(this.currentMatchday);
      this.showTable(1, this.currentMatchday);
    }
  }

}
