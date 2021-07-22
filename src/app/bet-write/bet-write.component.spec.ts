import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetWriteComponent } from './bet-write.component';

describe('BetWriteComponent', () => {
  let component: BetWriteComponent;
  let fixture: ComponentFixture<BetWriteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BetWriteComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BetWriteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
