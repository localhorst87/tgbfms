import { TestBed } from '@angular/core/testing';

import { MatchdataAccessOpenligaService } from './matchdata-access-openliga.service';

describe('MatchdataAccessOpenligaService', () => {
  let service: MatchdataAccessOpenligaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatchdataAccessOpenligaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
