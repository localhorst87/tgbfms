import { Component, OnChanges, Input, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { User } from '../Businessrules/basic_datastructures';
import { SEASON } from '../Businessrules/rule_defined_values';
import { BoxPlot, UserStats } from '../Dataaccess/import_datastructures';
import SwiperCore, { Pagination} from "swiper";
import { combineLatest } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { MatSelectChange } from '@angular/material/select';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';
SwiperCore.use([Pagination]);

interface DataPoint {
  "name": string,
  "value": number
};

interface DataSeries {
  "name": string;
  "series": DataPoint[]
};

interface StatsView {
  userName: string;
  meanPoints: string;
  standardDeviation: string;
  standardDevRel: string;
  currentForm: string;
  highestPoints: string;
  mostFrequentBet: string;
};

interface SpecificStatView {
  userName: string;
  statValue: string;
};

const NUM_RESULTS_PIE: number = 5;

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class StatisticsComponent implements OnChanges {
  @Input() user: User;
  @Input() matchdayCompleted: number;

  allUsers: User[] = [];
  otherUsers: User[] = [];
  allUserStats: UserStats[] = [];
  userStatsView: StatsView = {
    userName: "",
    meanPoints: "",
    standardDeviation: "",
    standardDevRel: "",
    currentForm: "",
    highestPoints: "",
    mostFrequentBet: ""
  };
  bestForm: SpecificStatView = {
    userName: "",
    statValue: ""
  };
  worstForm: SpecificStatView = {
    userName: "",
    statValue: ""
  };
  bestMean: SpecificStatView = {
    userName: "",
    statValue: ""
  }; 
  worstMean: SpecificStatView = {
    userName: "",
    statValue: ""
  }; 
  highestDeviation: SpecificStatView = {
    userName: "",
    statValue: ""
  };
  lowestDeviation: SpecificStatView = {
    userName: "",
    statValue: ""
  };
  highestDeviationRel: SpecificStatView = {
    userName: "",
    statValue: ""
  };
  lowestDeviationRel: SpecificStatView = {
    userName: "",
    statValue: ""
  };
  bestHighestPoints: SpecificStatView = {
    userName: "",
    statValue: ""
  };
  worstHighestPoints: SpecificStatView = {
    userName: "",
    statValue: ""
  };
  allMostFrequentBets: SpecificStatView[] = [];

  boxPlotData: DataSeries[] = [];
  frequentBets: DataPoint[] = [];
  positionHistoryData: DataSeries[] = [];
  formHistoryData: DataSeries[] = [];

  pieColorScheme: Color = {
    name: "tgbfms",
    selectable: true,
    group: ScaleType.Linear,
    domain: ["#f44336", "#f57c00", "#ffa726", "#ffcc80", "#ffe3b3", "#eeeeee"]
  };
  lineColorScheme: Color = {
    name: "tgbfms",
    selectable: true,
    group: ScaleType.Linear,
    domain: ["#ffa726", "#f44336", "#48a999"]
  };
  formHistoryOptions: {
    yMin: number;
    yMax: number;
    ticks: number[];
    formattingFcn: (val: number) => string;
  } = {
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
  positionHistoryOptions: {
    yMin: number;
    yMax: number;
    ticks: number[];
    formattingFcn: (val: number) => number;
  } = {
    yMin: 1,
    yMax: 1,
    ticks: [],
    formattingFcn: val => Math.round(val)
  };
  below = LegendPosition.Below;

  boxPlotUsers = new FormControl();
  positionHistoryUsers = new FormControl();
  formHistoryUsers = new FormControl();

  contentsLoaded: boolean = false;

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
    this.matchdayCompleted = -1;
    this.boxPlotUsers.setValue([]);
    this.positionHistoryUsers.setValue([]);
    this.formHistoryUsers.setValue([]);
  }

  ngOnChanges(): void {
    if (this.matchdayCompleted > 0 && this.user.id != "") {

      combineLatest(this.appdata.getActiveUsers$().pipe(toArray()), this.appdata.getUserStats$(SEASON, this.matchdayCompleted).pipe(toArray())).subscribe(
        ([allUsers, allStats]) => {
          // set public properties
          this.allUsers = allUsers;
          this.otherUsers = allUsers.filter((user: User) => user.id !== this.user.id);
          this.allUserStats = allStats;
          
          // get stats of logged-in user
          const userStats: UserStats = allStats.find((userStats: UserStats) => userStats.userId == this.user.id)!;

          // Current form
          this.userStatsView.currentForm = userStats.currentForm !== undefined ? String(userStats.currentForm) : "";
          this.bestForm = this.getHighestStat(1, 1, "currentForm");
          this.worstForm = this.getLowestStat(1, 1, "currentForm");

          // mean points
          this.userStatsView.meanPoints = userStats.meanPoints !== undefined ? String(Math.round(10*userStats.meanPoints)/10) : "";
          this.bestMean = this.getHighestStat(1, 1, "meanPoints");
          this.worstMean = this.getLowestStat(1, 1, "meanPoints");

          // standard deviation          
          this.userStatsView.standardDeviation = userStats.stddev !== undefined ? String(Math.round(10*userStats.stddev)/10) : "";
          this.lowestDeviation = this.getLowestStat(1, 1, "stddev");
          this.highestDeviation = this.getHighestStat(1, 1, "stddev");
          
          // standard deviation relative
          this.userStatsView.standardDevRel = userStats.stddevRel !== undefined ? String(Math.round(100*userStats.stddevRel)) : "";
          this.lowestDeviationRel = this.getLowestStat(0, 100, "stddevRel");
          this.highestDeviationRel = this.getHighestStat(0, 100, "stddevRel");

          // highest points
          this.userStatsView.highestPoints = userStats.boxPlot !== undefined ? String(userStats.boxPlot.maximum) : "";
          this.bestHighestPoints = this.getHighestStat(0, 1, "boxPlot", "maximum");
          this.worstHighestPoints = this.getLowestStat(0, 1, "boxPlot", "maximum");

          // most frequent bet
          this.userStatsView.mostFrequentBet = userStats.mostFrequentBets !== undefined ? userStats.mostFrequentBets[0].result : "";
          this.allMostFrequentBets = [];
          for (let userStat of allStats) {
            if (userStat.userId !== this.user.id) {
              this.allMostFrequentBets.push({
                userName: this.getUserDisplayName(userStat.userId),
                statValue: userStat.mostFrequentBets !== undefined ? String(userStat.mostFrequentBets[0].result) : ""
              })
            }
          }

          // Box-Plot
          this.addBoxPlotData(this.user.id, userStats.boxPlot!);
          this.boxPlotData[0].name = "";

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
          this.positionHistoryOptions.ticks = Array.from(allUsers, (_, i) => allUsers.length - i);
          this.positionHistoryOptions.yMin = allUsers.length;

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

  public setBoxPlotDiagram(change: MatSelectChange) {
    const userIds: string[] = change.value;

    this.resetBoxPlotData();

    for (let userId of userIds) {
      let userStats: UserStats = this.allUserStats.find(stat => stat.userId == userId)!;
      this.addBoxPlotData(userId, userStats.boxPlot!);      
    }

    if(this.boxPlotData.length > 1)
      this.boxPlotData[0].name = "Du";
    else
    this.boxPlotData[0].name = "";

    this.boxPlotData = [...this.boxPlotData];
  }

  public setPositionDiagram(change: MatSelectChange): void {
    const userIds: string[] = change.value;

    this.resetPositionHistoryData();

    for (let userId of userIds) {
      let userStats: UserStats = this.allUserStats.find(stat => stat.userId == userId)!;
      this.addPositionHistoryData(userId, userStats.positionHistory!);      
    }

    if(this.positionHistoryData.length > 1)
      this.positionHistoryData[0].name = "Du";
    else
    this.positionHistoryData[0].name = "";

    this.positionHistoryData = [...this.positionHistoryData];
  }

  public setFormDiagram(change: MatSelectChange): void {
    const userIds: string[] = change.value;

    this.resetFormHistoryData();

    for (let userId of userIds) {
      let userStats: UserStats = this.allUserStats.find(stat => stat.userId == userId)!;
      this.addFormHistoryData(userId, userStats.formHistory!);      
    }

    if(this.formHistoryData.length > 1)
      this.formHistoryData[0].name = "Du";
    else
    this.formHistoryData[0].name = "";

    this.formHistoryData = [...this.formHistoryData];
  }

  private addBoxPlotData(userId: string, boxPlotData: BoxPlot): void {
    this.boxPlotData.push({
      name: this.getUserDisplayName(userId),
      series: [
        {
          name: "min",
          value: boxPlotData.minimum
        },
        {
          name: "lower_q",
          value: boxPlotData.lowerQuartile
        },
        {
          name: "median",
          value: boxPlotData.median
        },
        {
          name: "upper_q",
          value: boxPlotData.upperQuartile
        },
        {
          name: "max",
          value: boxPlotData.maximum
        },      
      ]
    });
  }

  private resetBoxPlotData(): void {
    this.boxPlotData = [this.boxPlotData[0]];
  }

  private resetPositionHistoryData(): void {
    this.positionHistoryData = [this.positionHistoryData[0]];
  }

  private resetFormHistoryData(): void {
    this.formHistoryData = [this.formHistoryData[0]];
  }

  private addPositionHistoryData(userId: string, positionHistory: number[]): void {
    this.positionHistoryData.push({
      name: this.getUserDisplayName(userId),
      series: []
    });

    for (let [i, position] of positionHistory.entries()) {
      this.positionHistoryData[this.positionHistoryData.length - 1].series.push({
        name: String(i+1),
        value: position
      });
    }
  }

  private addFormHistoryData(userId: string, formHistory: number[]): void {
    this.formHistoryData.push({
      name: this.getUserDisplayName(userId),
      series: []
    });

    for (let [i, form] of formHistory.entries()) {
      this.formHistoryData[this.formHistoryData.length - 1].series.push({
        name: String(i+1),
        value: form
      });
    }
  }

  private getHighestStat(roundToDecimal: number, preFactor: number, propertyName: string, subProperty?: string): SpecificStatView {
    let userHighest: UserStats;
    let rawValue: number;

    if (subProperty !== undefined) {
      userHighest = [...this.allUserStats].sort((a, b) => (b as any)[propertyName][subProperty] - (a as any)[propertyName][subProperty])[0];
      rawValue = (userHighest as any)[propertyName][subProperty];
    }
    else {
      userHighest = [...this.allUserStats].sort((a, b) => (b as any)[propertyName] - (a as any)[propertyName])[0];
      rawValue = (userHighest as any)[propertyName];
    }
  
    return {
      userName: this.getUserDisplayName(userHighest.userId),
      statValue: String(Math.round(Math.pow(10, roundToDecimal) * preFactor * rawValue) / Math.pow(10, roundToDecimal))
    };
  }

  private getLowestStat(roundToDecimal: number, preFactor: number, propertyName: string, subProperty?: string): SpecificStatView {
    let userLowest: UserStats;
    let rawValue: number;

    if (subProperty !== undefined) {
      userLowest = [...this.allUserStats].sort((a, b) => (a as any)[propertyName][subProperty] - (b as any)[propertyName][subProperty])[0];
      rawValue = (userLowest as any)[propertyName][subProperty];
    }
    else {
      userLowest = [...this.allUserStats].sort((a, b) => (a as any)[propertyName] - (b as any)[propertyName])[0];
      rawValue = (userLowest as any)[propertyName];
    }
  
    return {
      userName: this.getUserDisplayName(userLowest.userId),
      statValue: String(Math.round(Math.pow(10, roundToDecimal) * preFactor * rawValue) / Math.pow(10, roundToDecimal))
    };
  }

  private getUserDisplayName(userId: string): string {
    const idxUser: number = this.allUsers.findIndex((user: User) => user.id == userId);

    if (idxUser > -1) {
      return this.allUsers[idxUser].displayName;
    }
    else {
      return "unknown user";
    }     
  }
}
