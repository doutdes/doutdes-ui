import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {StoreService} from './store.service';

@Injectable()
export class FacebookMarketingService {

  constructor(
    private http: HttpClient,
    private storeService: StoreService) {
  }

  // Here they will be the various back-end calls (insights, campaings, etc.)

  private getAuthorization = (): HttpHeaders =>
    new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`)

}
