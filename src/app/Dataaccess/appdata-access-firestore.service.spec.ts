import { TestBed } from '@angular/core/testing';

import { AppdataAccessFirestoreService } from './appdata-access-firestore.service';

describe('AppdataAccessFirestoreService', () => {
  let service: AppdataAccessFirestoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppdataAccessFirestoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
