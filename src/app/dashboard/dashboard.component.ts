import { Component, OnInit, OnChanges, Input, ViewEncapsulation } from '@angular/core';
import { Observable, interval, range, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import SwiperCore from "swiper";
import { Pagination } from "swiper";
import { SEASON } from '../Businessrules/rule_defined_values';
import { FetchBasicDataService } from '../UseCases/fetch-basic-data.service';
import { FetchStatisticsDataService } from '../UseCases/fetch-statistics-data.service';
import { FetchTableService } from '../UseCases/fetch-table.service';
import { MatchInfo, TableData } from '../UseCases/output_datastructures';
SwiperCore.use([Pagination]);

interface DataPoint {
  "name": string,
  "value": number
}

interface DataSeries {
  "name": string;
  "series": DataPoint[]
}

const NUM_NEXT_MATCHES: number = 5;
const INTERVAL_TIME_REFRESH: number = 1 * 1000; // 1 sec
const HISTORY_MATCHES: number = 5;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit, OnChanges {

  @Input() userId: string;
  @Input() matchdayNextMatch: number;
  @Input() matchdayCurrent: number;
  @Input() matchdayCompleted: number;
  elementsLoaded: number;
  currentForm: number;
  nextMatchesInfo: MatchInfo[];
  currentTime: Date;
  tableLeader: string;
  tableData: DataPoint[];
  formHistoryData: DataSeries[]
  tableHistoryData: DataSeries[];
  formHistoryOptions: {
    yMin: number;
    yMax: number;
    ticks: number[];
  };
  tableHistoryOptions: {
    yMin: number;
    yMax: number;
    ticks: number[];
    formattingFcn: (val: number) => number;
  };
  True: boolean = true;
  False: boolean = false;

  constructor(
    private fetchBasicService: FetchBasicDataService,
    private fetchStatsService: FetchStatisticsDataService,
    private fetchTableService: FetchTableService) {

    this.userId = "";
    this.matchdayNextMatch = -1;
    this.matchdayCompleted = -1;
    this.matchdayCurrent = -1;
    this.elementsLoaded = 0;
    this.currentForm = 0;
    this.nextMatchesInfo = [];
    this.currentTime = new Date();
    this.tableLeader = "";
    this.tableData = [
      {
        "name": "Zweiter",
        "value": 2
      },
      {
        "name": "Dritter",
        "value": 3
      },
      {
        "name": "Vorletzter",
        "value": 7
      },
      {
        "name": "Letzter",
        "value": 8
      }
    ];
    this.formHistoryData = [
      {
        "name": "Form",
        "series": [
          {
            "name": "1",
            "value": 0
          },
          {
            "name": "2",
            "value": 0
          },
          {
            "name": "3",
            "value": 0
          },
          {
            "name": "4",
            "value": 0
          },
          {
            "name": "5",
            "value": 0
          },
        ]
      }
    ];
    this.tableHistoryData = [
      {
        "name": "Platz",
        "series": [
          {
            "name": "1",
            "value": 1
          },
          {
            "name": "2",
            "value": 1
          },
          {
            "name": "3",
            "value": 1
          },
          {
            "name": "4",
            "value": 1
          },
          {
            "name": "5",
            "value": 1
          }
        ]
      }
    ];
    this.formHistoryOptions = {
      yMin: -10,
      yMax: 10,
      ticks: [-10, -5, 0, 5, 10]
    }
    this.tableHistoryOptions = {
      yMin: 1,
      yMax: 1,
      ticks: [],
      formattingFcn: val => Math.round(val)
    }
  }

  ngOnInit(): void {

    // refresh current time
    interval(INTERVAL_TIME_REFRESH).subscribe(
      val => {
        this.currentTime = new Date();
      }
    );

    // set axis of Table History depending on number of users
    this.fetchBasicService.fetchNumberOfUsers$().subscribe(
      (nUsers: number) => {
        this.tableHistoryOptions.yMin = nUsers;
        for (let i = 1; i <= nUsers; i++) {
          this.tableHistoryOptions.ticks.push(i);
        }
      }
    );
  }

  ngOnChanges(): void {
    this.elementsLoaded = 0;

    if (this.matchdayNextMatch != -1 && this.matchdayCompleted != -1 && this.userId != "") {

      this.fetchBasicService.fetchNextMatchInfos$(SEASON, this.userId, NUM_NEXT_MATCHES).subscribe(
        (matchInfo: MatchInfo) => {
          this.nextMatchesInfo.push(matchInfo);
        },
        (err) => { },
        () => { this.elementsLoaded++; }

      );

      this.formHistoryData[0].series = []; // clear formHistoryData
      this.tableHistoryData[0].series = []; // clear tableHistoryData
      this.tableData = []; // clear tableData
      let startMatchday: number;
      let matchdayCount: number;
      let endMatchday: number;
      let currentMatchday: number;
      let matchdaysToFetch$: Observable<number>;

      if (this.matchdayCompleted > 0) {
        startMatchday = Math.max(1, this.matchdayCompleted - HISTORY_MATCHES + 1);
        matchdayCount = Math.min(this.matchdayCompleted, HISTORY_MATCHES);
        endMatchday = this.matchdayCompleted;
        currentMatchday = this.matchdayCurrent;
        matchdaysToFetch$ = range(startMatchday, matchdayCount);
      }
      else {
        startMatchday = 0;
        matchdayCount = 0;
        endMatchday = 0;
        currentMatchday = 0;
        matchdaysToFetch$ = of(0);
      }

      // update Form History Data
      matchdaysToFetch$.pipe(
        concatMap((matchday: number) => this.fetchStatsService.fetchFormByUserId$(SEASON, matchday, this.userId).pipe(
          map((form: number) => { return { "name": String(matchday), "value": form }; })
        ))
      ).subscribe(
        (dataPoint: DataPoint) => {
          this.formHistoryData[0].series.push(dataPoint);
        },
        (err) => { },
        () => {
          this.formHistoryData = [...this.formHistoryData];
          this.elementsLoaded++;
        }
      );

      // update Table History Data
      let j = 0;
      this.fetchTableService.fetchUserPlaceForMatchdays$(SEASON, startMatchday, endMatchday, this.userId).pipe(
        map((place: number) => { return { "name": String(startMatchday + j++), "value": place }; })
      ).subscribe(
        (dataPoint: DataPoint) => {
          this.tableHistoryData[0].series.push(dataPoint);
        },
        (err) => { },
        () => {
          this.tableHistoryData = [...this.tableHistoryData];
          this.elementsLoaded++;
        }
      );

      // update current user Form
      this.fetchStatsService.fetchFormByUserId$(SEASON, endMatchday, this.userId).subscribe(
        val => { this.currentForm = val },
        (err) => { },
        () => {
          this.elementsLoaded++;
        }
      );

      // update Table History Data
      this.fetchTableService.fetchTotalTableForMatchdays$(SEASON, currentMatchday).subscribe(
        (tableDataArray: TableData[]) => {
          this.tableLeader = tableDataArray[0].userName;
          let leaderPoints: number = tableDataArray[0].points;
          let n: number = tableDataArray.length;

          // add gap-to-leader of second, third, second-last and last place
          this.tableData.push({ "name": tableDataArray[1].userName, "value": leaderPoints - tableDataArray[1].points });
          this.tableData.push({ "name": tableDataArray[2].userName, "value": leaderPoints - tableDataArray[2].points });
          this.tableData.push({ "name": tableDataArray[n - 2].userName, "value": leaderPoints - tableDataArray[n - 2].points });
          this.tableData.push({ "name": tableDataArray[n - 1].userName, "value": leaderPoints - tableDataArray[n - 1].points });
        },
        (err) => { },
        () => {
          this.tableData = [...this.tableData];
          this.elementsLoaded++;
        }
      );
    }
  }
}
