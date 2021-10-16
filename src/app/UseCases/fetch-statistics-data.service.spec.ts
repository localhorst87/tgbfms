import { TestBed } from '@angular/core/testing';

import { FetchStatisticsDataService } from './fetch-dashboard-data.service';

describe('FetchStatisticsDataService', () => {
  let service: FetchStatisticsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchStatisticsDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
