import { TestBed } from '@angular/core/testing';

import { MatchdataAccessService } from './matchdata-access.service';

describe('MatchdataAccessService', () => {
  let service: MatchdataAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatchdataAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
