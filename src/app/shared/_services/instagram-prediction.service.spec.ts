import { TestBed, inject } from '@angular/core/testing';

import { InstagramPredictionService } from './instagram-prediction.service';

describe('InstagramPredictionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InstagramPredictionService]
    });
  });

  it('should be created', inject([InstagramPredictionService], (service: InstagramPredictionService) => {
    expect(service).toBeTruthy();
  }));
});
