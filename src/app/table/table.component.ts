import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { Sort } from '@angular/material/sort';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { StatisticsCalculatorService } from '../Businessrules/statistics-calculator.service';
import { Table, TableData } from '../UseCases/output_datastructures';
import { SEASON, MATCHDAYS_PER_SEASON } from '../Businessrules/rule_defined_values';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  @Input() currentMatchday: number;
  MATCHDAY_MAX: number;
  isPanelExpanded: boolean;
  selectMatchdayForm: FormControl; // slider that indicates the reference matchday of the table
  selectedMatchday: number;
  @ViewChild("table") tableFrame!: MatTable<TableData>;
  tableData: TableData[];
  tableLabel: string;
  propertiesDefault: string[];
  propertiesIncludeSeason: string[];
  propertiesToDisplay: string[];
  tableLoaded: boolean;

  constructor(
    private appdata: AppdataAccessService,
    private formBuilder: FormBuilder,
    private statCalc: StatisticsCalculatorService) {
    this.currentMatchday = -1;
    this.MATCHDAY_MAX = MATCHDAYS_PER_SEASON
    this.isPanelExpanded = false;
    this.selectMatchdayForm = this.formBuilder.control(1);
    this.selectedMatchday = -1;
    this.tableData = [];
    this.tableLabel = "Tageswertung";
    this.propertiesDefault = ["place", "userName", "points", "matches", "results", "extraTop", "extraOutsider"];
    this.propertiesIncludeSeason = ["place", "userName", "points", "matches", "results", "extraTop", "extraOutsider", "extraSeason"];
    this.propertiesToDisplay = this.propertiesDefault;
    this.tableLoaded = false;
    this.subscribeCorrectingSliders();
  }

  /**
   * Fill the table with new data according to the given matchdays and renders the data!
   * 
   * @param id the table to show ("total", "final", "matchday", "last_5", "last_10", "second_half")
   */
  showTable(id: string): void {
    this.tableLoaded = false;
    let newTableData: TableData[] = [];
    let matchday: number = -1;

    switch(id) {
      case "matchday":
        this.tableLabel = "Tageswertung";
        matchday = this.selectMatchdayForm.value;
        break;
      case "total":
        this.tableLabel = "Gesamtwertung";
        matchday = this.selectMatchdayForm.value;
        break;
      case "final":
        this.tableLabel = "Komplettwertung";
        matchday = this.selectMatchdayForm.value;
        break;
      case "first_half":
        this.tableLabel = "Hinrunde";
        matchday = Math.min(this.selectMatchdayForm.value, MATCHDAYS_PER_SEASON / 2);
        id = "total";
        break;
      case "second_half":
        this.tableLabel = "Rückrunde";
        matchday = Math.max(this.selectMatchdayForm.value, MATCHDAYS_PER_SEASON / 2 + 1);
        break;
      case "last_5":
        this.tableLabel = "Letzte 5 Spieltage";
        matchday = this.selectMatchdayForm.value;
        break;
      case "last_10":
        this.tableLabel = "Letzte 10 Spieltage";
        matchday = this.selectMatchdayForm.value;
        break;   
    }

    this.appdata.getTableView$(id, SEASON, matchday).subscribe(
      (table: Table) => {
        newTableData = table.tableData;
      },
      err => { },
      () => {
        this.tableData = newTableData;
        this.tableFrame.renderRows();
        this.adjustProperties(id);
        this.selectedMatchday = this.selectMatchdayForm.value;
        this.tableLoaded = true;
      }
    )

    this.isPanelExpanded = false;
  }

  sortNew(sortState: Sort): void {

    if (sortState.active == "matches") {
      if (sortState.direction == "desc") {
        this.tableData.sort((a, b) => b.matches - a.matches);
      }
      else if (sortState.direction == "asc") {
        this.tableData.sort((a, b) => a.matches - b.matches);
      }
      else {
        this.tableData.sort(this.statCalc.compareScores);
      }
    }
    else if (sortState.active == "results") {
      if (sortState.direction == "desc") {
        this.tableData.sort((a, b) => b.results - a.results);
      }
      else if (sortState.direction == "asc") {
        this.tableData.sort((a, b) => a.results - b.results);
      }
      else {
        this.tableData.sort(this.statCalc.compareScores);
      }
    }
    else if (sortState.active == "extraTop") {
      if (sortState.direction == "desc") {
        this.tableData.sort((a, b) => b.extraTop - a.extraTop);
      }
      else if (sortState.direction == "asc") {
        this.tableData.sort((a, b) => a.extraTop - b.extraTop);
      }
      else {
        this.tableData.sort(this.statCalc.compareScores);
      }
    }
    else if (sortState.active == "extraOutsider") {
      if (sortState.direction == "desc") {
        this.tableData.sort((a, b) => b.extraOutsider - a.extraOutsider);
      }
      else if (sortState.direction == "asc") {
        this.tableData.sort((a, b) => a.extraOutsider - b.extraOutsider);
      }
      else {
        this.tableData.sort(this.statCalc.compareScores);
      }
    }
    else if (sortState.active == "extraSeason") {
      if (sortState.direction == "desc") {
        this.tableData.sort((a, b) => b.extraSeason - a.extraSeason);
      }
      else if (sortState.direction == "asc") {
        this.tableData.sort((a, b) => a.extraSeason - b.extraSeason);
      }
      else {
        this.tableData.sort(this.statCalc.compareScores);
      }
    }
    else {
      this.tableData.sort(this.statCalc.compareScores);
    }

    this.tableFrame.renderRows();
    return;
  }

  adjustProperties(id: string): void {
    if (id == "final") {
      this.propertiesToDisplay = this.propertiesIncludeSeason;
    } else {
      this.propertiesToDisplay = this.propertiesDefault;
    }
  }

  subscribeCorrectingSliders(): void {
    // starts the subscription for plausibility check and correction of the
    // slider start and end value

    this.selectMatchdayForm.valueChanges.subscribe(newValue => {
      if (newValue > this.currentMatchday) {
        this.selectMatchdayForm.setValue(this.currentMatchday);
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.currentMatchday > 0) {
      this.selectMatchdayForm.setValue(this.currentMatchday);
      this.showTable("matchday");
    }
  }

}
