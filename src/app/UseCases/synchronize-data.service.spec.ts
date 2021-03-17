import { TestBed } from '@angular/core/testing';

import { SynchronizeDataService } from './synchronize-data.service';

describe('SynchronizeDataService', () => {
  let service: SynchronizeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SynchronizeDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
