import { Injectable } from '@angular/core';
import { TopMatchVote } from './basic_datastructures';

@Injectable()
export abstract class UserInteractionService {
  public abstract evaluateTopMatchVotes(topMatchVotes: TopMatchVote[], matchdayMatchIds: number[]): number;
}
