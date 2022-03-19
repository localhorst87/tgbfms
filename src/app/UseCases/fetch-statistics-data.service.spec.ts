import { TestBed } from '@angular/core/testing';
import { FetchStatisticsDataService } from './fetch-statistics-data.service';

describe('FetchStatisticsDataService', () => {
  let service: FetchStatisticsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FetchStatisticsDataService]
    });
    service = TestBed.inject(FetchStatisticsDataService);
  });

  // it('should be created', () => {
  //   expect(service).toBeTruthy();
  // });
});
