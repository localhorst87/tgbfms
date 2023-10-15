import { Component, OnInit, OnChanges, Input, ViewEncapsulation } from '@angular/core';
import { Observable, interval, range, of } from 'rxjs';
import { map } from 'rxjs/operators';
import SwiperCore from "swiper";
import { Pagination } from "swiper";
import { SEASON } from '../Businessrules/rule_defined_values';
import { FetchBasicDataService } from '../UseCases/fetch-basic-data.service';
import { MatchInfo, Table, TableData } from '../UseCases/output_datastructures';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { UserStats } from '../Dataaccess/import_datastructures';
import { Color, ScaleType } from '@swimlane/ngx-charts';
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
  lineColorScheme: Color;
  True: boolean = true;
  False: boolean = false;

  constructor(
    private fetchBasicService: FetchBasicDataService,
    private appdata: AppdataAccessService) {

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
    };
    this.tableHistoryOptions = {
      yMin: 1,
      yMax: 1,
      ticks: [],
      formattingFcn: val => Math.round(val)
    };
    this.lineColorScheme = {
        name: "tgbfms",
        selectable: true,
        group: ScaleType.Linear,
        domain: ["#ffa726"]
    };

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
        (err) => { console.log(err); },
        () => { this.elementsLoaded++; }

      );

      this.formHistoryData[0].series = []; // clear formHistoryData
      this.tableHistoryData[0].series = []; // clear tableHistoryData
      this.tableData = []; // clear tableData
      let startMatchday: number;
      let matchdayCount: number;
      let finishedMatchday: number;
      let currentMatchday: number;
      let matchdaysToFetch: number[];

      if (this.matchdayCompleted > 0) {
        startMatchday = Math.max(1, this.matchdayCompleted - HISTORY_MATCHES + 1);
        matchdayCount = Math.min(this.matchdayCompleted, HISTORY_MATCHES);
        finishedMatchday = this.matchdayCompleted;
        currentMatchday = this.matchdayCurrent;
        matchdaysToFetch = Array.from({length: matchdayCount}, (_, i) => startMatchday + i);
      }
      else {
        startMatchday = 0;
        matchdayCount = 0;
        finishedMatchday = 0;
        currentMatchday = 0;
        matchdaysToFetch = [];
      }

      // update Form History Data
      this.appdata.getUserStats$(SEASON, finishedMatchday, this.userId).subscribe(
        (userStats: UserStats) => {
          for (let matchday of matchdaysToFetch) {
            // add current form
            if (userStats.currentForm !== undefined)
              this.currentForm = userStats.currentForm;
            else
              this.currentForm = 0;

            // add form history
            let formDataPoint: DataPoint;
            if (userStats.formHistory !== undefined)
              formDataPoint = { "name": String(matchday), "value": userStats.formHistory[matchday - 1] };
            else
              formDataPoint = { "name": String(matchday), "value": 0 };
            this.formHistoryData[0].series.push(formDataPoint);

            // add position history
            let tableDataPoint: DataPoint;
            if (userStats.positionHistory !== undefined)
              tableDataPoint = { "name": String(matchday), "value": userStats.positionHistory[matchday - 1] };
            else
              tableDataPoint = { "name": String(matchday), "value": 0 };
            this.tableHistoryData[0].series.push(tableDataPoint);
          }
        },
        (err) => { console.log(err); },
        () => {
          this.formHistoryData = [...this.formHistoryData];
          this.tableHistoryData = [...this.tableHistoryData];
          this.elementsLoaded++;
          this.elementsLoaded++;
          this.elementsLoaded++;
        }
      )

      // update Table Data
      this.appdata.getTableView$("total", SEASON, currentMatchday).pipe(map((table: Table) => table.tableData)).subscribe(
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
