import { Injectable } from '@angular/core';
import { UserInteractionService } from './user-interaction.service';
import { TopMatchVote, VoteCount } from './basic_datastructures';

@Injectable({
  providedIn: 'root'
})
export class UserInteractionVoteBasedService implements UserInteractionService {
  constructor() { }

  evaluateTopMatchVotes(topMatchVotes: TopMatchVote[], matchdayMatchIds: number[]): number {
    // returns the id of the top match according to the given votes.
    // if no votes are given, a random selection will be done

    let voteCount: VoteCount[] = [];
    let filteredVotes: TopMatchVote[];

    for (let matchId of matchdayMatchIds) {
      filteredVotes = topMatchVotes.filter((vote: TopMatchVote) => vote.matchId == matchId);
      let maxTimestamp: number = filteredVotes.reduce((reducedTime, currentVote) => Math.max(reducedTime, currentVote.timestamp), -1)

      voteCount.push({
        matchId: matchId,
        nVotes: filteredVotes.length,
        lastVoteTime: maxTimestamp
      });
    }
    voteCount.sort(this.sortVotes);
    return voteCount[0].matchId;

  }

  private sortVotes(a: any, b: any): number {
    // sorting function for the votes. Sorts the votes acording to
    // 1st: the number of votes,
    // 2nd: the minimum timestamp of the last vote
    // 3rd: a random selection

    if (a.nVotes != b.nVotes) {
      return b.nVotes - a.nVotes;
    }
    else if (a.lastVoteTime != b.lastVoteTime) {
      return a.lastVoteTime - b.lastVoteTime;
    }
    else {
      return Math.floor(Math.random() * 2) - 0.5; // returns either 0.5 or -0.5
    }
  }
}
