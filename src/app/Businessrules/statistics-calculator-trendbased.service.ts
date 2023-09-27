import { Injectable } from '@angular/core';
import { StatisticsCalculatorService } from './statistics-calculator.service';

@Injectable()
export class StatisticsCalculatorTrendbasedService implements StatisticsCalculatorService {
  constructor() { }

  compareScores(firstEl: any, secondEl: any): number {
    // used as sorting function to sort table according to business rules
    // elements must fulfill properties "points", "matches" and "results"

    if (firstEl.points != secondEl.points) {
      return secondEl.points - firstEl.points;
    }
    else if (firstEl.matches != secondEl.matches) {
      return secondEl.matches - firstEl.matches;
    }
    else if (firstEl.results != secondEl.results) {
      return secondEl.results - firstEl.results;
    }
    else {
      return 0;
    }
  }

}
