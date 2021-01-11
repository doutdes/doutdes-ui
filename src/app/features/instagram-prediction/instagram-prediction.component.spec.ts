import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstagramPredictionComponent } from './instagram-prediction.component';

describe('InstagramPredictionComponent', () => {
  let component: InstagramPredictionComponent;
  let fixture: ComponentFixture<InstagramPredictionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstagramPredictionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstagramPredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
