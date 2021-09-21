import { Component, OnInit, OnChanges, Input, ViewEncapsulation } from '@angular/core';
import { interval } from 'rxjs';
import { SwiperComponent } from "swiper/angular";
import SwiperCore from "swiper";
import { Pagination } from "swiper";
import { SEASON, MATCHDAYS_PER_SEASON } from '../Businessrules/rule_defined_values';
import { FetchBasicDataService } from '../UseCases/fetch-basic-data.service';
import { MatchInfo } from '../UseCases/output_datastructures';
SwiperCore.use([Pagination]);

const NUM_NEXT_MATCHES: number = 5;
const INTERVAL_TIME_REFRESH: number = 1 * 1000; // 1 sec

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit, OnChanges {

  @Input() userId: string;
  @Input() matchdayNextMatch: number;
  nextMatchesInfo: MatchInfo[];
  topMatchInfo: MatchInfo;
  currentTime: Date;

  constructor(private fetchBasicService: FetchBasicDataService) {
    this.userId = "";
    this.matchdayNextMatch = -1;
    this.nextMatchesInfo = [];
    this.topMatchInfo = {
      matchDate: new Date(-1),
      matchday: -1,
      teamNameHome: "",
      teamNameAway: "",
      teamNameShortHome: "",
      teamNameShortAway: "",
      placeHome: -1,
      placeAway: -1,
      pointsHome: -1,
      pointsAway: -1,
      betGoalsHome: -1,
      betGoalsAway: -1
    };
    this.currentTime = new Date();
  }

  ngOnInit(): void {
    interval(INTERVAL_TIME_REFRESH).subscribe(
      val => {
        this.currentTime = new Date();
      }
    );
  }

  ngOnChanges(): void {
    if (this.matchdayNextMatch > 0 && this.userId != "") {
      // this.nextMatchesInfo = [];
      this.fetchBasicService.fetchNextMatchInfos$(SEASON, this.userId, NUM_NEXT_MATCHES).subscribe(
        (matchInfo: MatchInfo) => {
          this.nextMatchesInfo.push(matchInfo);
        }
      );

      this.fetchBasicService.fetchTopMatchInfos$(SEASON, this.userId, this.matchdayNextMatch).subscribe(
        (matchInfo: MatchInfo) => {
          this.topMatchInfo = matchInfo;
        }
      );
    }
  }

}
