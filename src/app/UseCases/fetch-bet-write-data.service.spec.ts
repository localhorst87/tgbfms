import { TestBed } from '@angular/core/testing';

import { FetchBetWriteDataService } from './fetch-bet-write-data.service';

describe('FetchBetWriteDataService', () => {
  let service: FetchBetWriteDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchBetWriteDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
