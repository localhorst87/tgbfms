import { TestBed } from '@angular/core/testing';

import { FetchBetOverviewService } from './fetch-bet-overview.service';

describe('FetchBetOverviewService', () => {
  let service: FetchBetOverviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchBetOverviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
