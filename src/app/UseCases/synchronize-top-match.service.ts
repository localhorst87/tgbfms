import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { tap, map, toArray, pluck, delay } from 'rxjs/operators';
import { Match, TopMatchVote } from '../Businessrules/basic_datastructures';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { UserInteractionService } from '../Businessrules/user-interaction.service';

@Injectable({
  providedIn: 'root'
})
export class SynchronizeTopMatchService {

  constructor(
    private appDataAccess: AppdataAccessService,
    private userInteraction: UserInteractionService) { }

  fetchTopMatchIdToSet$(season: number, matchday: number): Observable<number> {
    // gets the votes and match IDs from the given matchday and invokes the
    // evaluateTopMatchVote method to get the top match ID

    return combineLatest(
      this.appDataAccess.getTopMatchVotes$(season, matchday).pipe(toArray()),
      this.appDataAccess.getMatchesByMatchday$(season, matchday).pipe(
        pluck("matchId"),
        toArray()
      ),
      (votes: TopMatchVote[], matchIds: number[]) => {
        return this.userInteraction.evaluateTopMatchVotes(votes, matchIds);
      }
    );
  }

  isTopMatchExisting$(season: number, matchday: number): Observable<boolean> {
    // returns true if the top match for the given matchday is available
    // otherwise returns false

    return this.appDataAccess.getTopMatch$(season, matchday).pipe(
      map((match: Match) => match.matchId != -1)
    );
  }

  setTopMatch(matchId: number): void {
    // sets isTopMatch=true for the given match

    this.appDataAccess.getMatch$(matchId).subscribe(
      (match: Match) => {
        if (match.matchId != -1) {
          match.isTopMatch = true;
          this.appDataAccess.updateMatch(match.documentId, match);
        }
      }
    );
  }

}
