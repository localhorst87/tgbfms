import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetOverviewComponent } from './bet-overview.component';

describe('BetOverviewComponent', () => {
  let component: BetOverviewComponent;
  let fixture: ComponentFixture<BetOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BetOverviewComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BetOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
