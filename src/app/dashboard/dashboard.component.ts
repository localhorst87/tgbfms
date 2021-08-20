import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { SEASON, MATCHDAYS_PER_SEASON } from '../Businessrules/rule_defined_values';
import { FetchBasicDataService } from '../UseCases/fetch-basic-data.service';
import { MatchInfo } from '../UseCases/output_datastructures';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnChanges {

  @Input() matchdayNextMatch: number;
  nextMatchInfo: MatchInfo;
  topMatchInfo: MatchInfo;

  constructor(private fetchBasicService: FetchBasicDataService) {
    this.matchdayNextMatch = -1;
    this.nextMatchInfo = {
      matchDate: new Date(-1),
      matchday: -1,
      teamNameHome: "",
      teamNameAway: "",
      teamNameShortHome: "",
      teamNameShortAway: "",
      placeHome: -1,
      placeAway: -1,
      pointsHome: -1,
      pointsAway: -1
    };
    this.topMatchInfo = this.nextMatchInfo;
  }

  ngOnInit(): void {
    this.fetchBasicService.fetchNextMatchInfos$(SEASON).subscribe(
      (matchInfo: MatchInfo) => {
        this.nextMatchInfo = matchInfo;
      }
    );
  }

  ngOnChanges(): void {
    if (this.matchdayNextMatch > 0) {
      this.fetchBasicService.fetchTopMatchInfos$(SEASON, this.matchdayNextMatch).subscribe(
        (matchInfo: MatchInfo) => {
          this.topMatchInfo = matchInfo;
        }
      );
    }
  }

}
