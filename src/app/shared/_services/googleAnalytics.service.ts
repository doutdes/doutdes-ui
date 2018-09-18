import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';
import {GoogleData} from '../_models/GoogleData';

@Injectable()
export class GoogleAnalyticsService {

  constructor(private http: HttpClient, private storeService: StoreService) {
  }

  gaBrowsers() {
    const headers = this.getAuthorization();
    return this.http.get<GoogleData[]>('http://' + environment.host + ':' + environment.port + '/ga/sessions', {headers});
  }

  getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }

}
