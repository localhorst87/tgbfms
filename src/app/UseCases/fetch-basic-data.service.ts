import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap, concatMap, distinct } from 'rxjs/operators';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { MatchdataAccessService } from '../Dataaccess/matchdata-access.service';
import { Team } from '../Businessrules/basic_datastructures';


@Injectable({
  providedIn: 'root'
})
export class FetchBasicDataService {

  constructor(private appData: AppdataAccessService, private matchData: MatchdataAccessService) { }

  public fetchActiveTeams$(season: number): Observable<Team> {
    // returns the requested frame data (data without user bets) as Observable

    return this.matchData.getActiveTeams$(season).pipe(
      mergeMap((teamId: number) => this.appData.getTeamByTeamId$(teamId)),
      distinct()
    );
  }
}
