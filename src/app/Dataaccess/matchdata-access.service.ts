import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatchImportData } from './import_datastructures';

@Injectable()
export abstract class MatchdataAccessService {
  public abstract importMatchdata$(season: number, matchday: number): Observable<MatchImportData>;
}
