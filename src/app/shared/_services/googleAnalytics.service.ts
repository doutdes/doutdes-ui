import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';
import {GoogleData, GoogleDataWithDate, GoogleMostViews, GooglePageViews, GoogleSessions, GoogleSources} from '../_models/GoogleData';

@Injectable()
export class GoogleAnalyticsService {

  constructor(private http: HttpClient, private storeService: StoreService) {
  }

  gaPageViews() {
    const headers = this.getAuthorization();
    return this.http.get<GooglePageViews>('http://' + environment.host + ':' + environment.port + '/ga/pageviews', {headers});
  }

  gaSessions() {
    const headers = this.getAuthorization();
    return this.http.get<GoogleSessions>('http://' + environment.host + ':' + environment.port + '/ga/sessions', {headers});
  }

  gaSources() {
    const headers = this.getAuthorization();
    return this.http.get<GoogleSources>('http://' + environment.host + ':' + environment.port + '/ga/sources', {headers});
  }

  gaMostViews() {
    const headers = this.getAuthorization();
    return this.http.get<GoogleMostViews>('http://' + environment.host + ':' + environment.port + '/ga/mostviews', {headers});
  }

  getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }

}
