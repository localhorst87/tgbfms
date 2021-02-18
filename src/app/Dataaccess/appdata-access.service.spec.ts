import { TestBed } from '@angular/core/testing';

import { AppdataAccessService } from './appdata-access.service';

describe('AppdataAccessService', () => {
  let service: AppdataAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppdataAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
