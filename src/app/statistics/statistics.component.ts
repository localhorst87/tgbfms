import { Component, OnInit, OnChanges, Input, ViewEncapsulation } from '@angular/core';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { User } from '../Businessrules/basic_datastructures';
import { SEASON } from '../Businessrules/rule_defined_values';
import { UserStats } from '../Dataaccess/import_datastructures';
import SwiperCore from "swiper";
import { Pagination, Autoplay} from "swiper";
import { AutoplayOptions } from 'swiper/types';
SwiperCore.use([Pagination, Autoplay]);


interface DataPoint {
  "name": string,
  "value": number
};

interface DataSeries {
  "name": string;
  "series": DataPoint[]
};

const NUM_RESULTS_PIE: number = 5;

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class StatisticsComponent implements OnInit, OnChanges {
  @Input() user: User;
  @Input() matchdayCompleted: number;
  allUsers: User[];
  meanPoints: string;
  standardDeviation: string;
  standardDevRel: string;
  currentForm: string;
  highestPoints: string;
  mostFrequentBet: string;
  boxPlotData: DataSeries[];
  frequentBets: DataPoint[];
  positionHistoryData: DataSeries[];
  formHistoryData: DataSeries[];
  pieColorScheme: any;
  formHistoryOptions: {
    yMin: number;
    yMax: number;
    ticks: number[];
    formattingFcn: (val: number) => string;
  };
  positionHistoryOptions: {
    yMin: number;
    yMax: number;
    ticks: number[];
    formattingFcn: (val: number) => number;
  };
  autoplayOptionsNumbers: AutoplayOptions;
  autoplayOptionsDiagrams: AutoplayOptions;
  contentsLoaded: boolean;
  usersLoaded: boolean;

  constructor(private appdata: AppdataAccessService) {
    this.user = {
      documentId: "",
      id: "",
      email: "",
      displayName: "",
      isAdmin: false,
      isActive: false,
      configs: {
        theme: "unknown",
        notificationLevel: -1,
        notificationTime: -1
      }
    };
    this.allUsers = [];
    this.matchdayCompleted = -1;
    this.boxPlotData = [];
    this.frequentBets = [];
    this.positionHistoryData = [];
    this.formHistoryData = [];
    this.pieColorScheme = {
      name: "tgbfms",
      selectable: true,
      group: 'bla',
      domain: ["#f44336", "#f57c00", "#ffa726", "#ffcc80", "#ffe3b3", "#eeeeee"]
    };
    this.formHistoryOptions = {
      yMin: -10,
      yMax: 10,
      ticks: [-10.0, -7.5, -5.0, -2.5, 0, 2.5, 5.0, 7.5, 10.0],
      formattingFcn: val => {
        if (val % 1 == 0) {
          return (String(val) + ".0");
        }
        else {
          return String(val);
        }
      }
    };
    this.positionHistoryOptions = {
      yMin: 1,
      yMax: 1,
      ticks: [],
      formattingFcn: val => Math.round(val)
    };
    this.meanPoints = "";
    this.standardDeviation = "";
    this.standardDevRel = "";
    this.currentForm = "";
    this.highestPoints = "";
    this.mostFrequentBet = "";
    this.autoplayOptionsNumbers = {
      delay: 5000,
      disableOnInteraction: true
    };
    this.autoplayOptionsDiagrams = {
      delay: 7500,
      disableOnInteraction: true
    };
    this.contentsLoaded = false;
    this.usersLoaded = false;
  }


  ngOnInit(): void {
    this.appdata.getActiveUsers$().subscribe(
      (users: User[]) => {
        this.allUsers = users;
        this.positionHistoryOptions.ticks = Array.from(users, (_, i) => users.length - i);
        this.positionHistoryOptions.yMin = users.length;
      },
      (err) => { console.log(err); },
      () => {
        this.usersLoaded = true;
      }   
    );
  }

  ngOnChanges(): void {
    if (this.matchdayCompleted > 0 && this.user.id != "") {

      this.appdata.getUserStats$(SEASON, this.matchdayCompleted, this.user.id).subscribe(
        (userStats: UserStats) => {

          // Number stats
          this.meanPoints = userStats.meanPoints !== undefined ? String(Math.round(10*userStats.meanPoints)/10) : "";
          this.standardDeviation = userStats.stddev !== undefined ? String(Math.round(10*userStats.stddev)/10) : "";
          this.standardDevRel = userStats.stddevRel !== undefined ? String(Math.round(100*userStats.stddevRel)) + "%" : "";
          this.highestPoints = userStats.boxPlot !== undefined ? String(userStats.boxPlot.maximum) : "";
          this.currentForm = userStats.currentForm !== undefined ? String(userStats.currentForm) : "";
          this.mostFrequentBet = userStats.mostFrequentBets !== undefined ? userStats.mostFrequentBets[0].result : "";

          // Box-Plot
          if (userStats.boxPlot !== undefined) {
            this.boxPlotData.push({
              name: "",
              series: []
            });

            this.boxPlotData[0].series[0] = {name: "min", value: userStats.boxPlot.minimum};
            this.boxPlotData[0].series[1] = {name: "lower_q", value: userStats.boxPlot.lowerQuartile};
            this.boxPlotData[0].series[2] = {name: "median", value: userStats.boxPlot.median};
            this.boxPlotData[0].series[3] = {name: "upper_q", value: userStats.boxPlot.upperQuartile};
            this.boxPlotData[0].series[4] = {name: "max", value: userStats.boxPlot.maximum};
          }

          // Most frequent bets
          if (userStats.mostFrequentBets !== undefined) {
            this.frequentBets = [];

            let percentageSum = 0;
            for (let [i, frequentBet] of userStats.mostFrequentBets.entries() ) {
              if (i < NUM_RESULTS_PIE) {
                let percentage: number = Math.round(100 * frequentBet.fraction);
                percentageSum += percentage;

                this.frequentBets.push({
                  name: frequentBet.result + " (" + percentage + "%)",
                  value: percentage
                });
              }
              else {
                let percentageOther: number = 100 - percentageSum;
                this.frequentBets.push({
                  name: "Rest" + " (" + percentageOther + "%)",
                  value: percentageOther
                });
                break;
              }
            }
          }

          // Position history
          if (userStats.positionHistory !== undefined) {
            this.positionHistoryData.push({
              name: this.user.displayName,
              series: []
            });

            for (let [i, position] of userStats.positionHistory.entries()) {
              this.positionHistoryData[0].series.push({
                name: String(i+1),
                value: position
              });
            }
          }

          // Form history
          if (userStats.formHistory !== undefined) {
            this.formHistoryData.push({
              name: this.user.displayName,
              series: []
            });

            for (let [i, form] of userStats.formHistory.entries()) {
              this.formHistoryData[0].series.push({
                name: String(i+1),
                value: form
              });
            }
          }
        },
        (err) => { console.log(err); },
        () => {
          this.boxPlotData = [...this.boxPlotData];
          this.frequentBets = [...this.frequentBets];
          this.positionHistoryData = [...this.positionHistoryData];
          this.formHistoryData = [...this.formHistoryData];
          this.contentsLoaded = true;
        }      
      );
    }
  }
}
