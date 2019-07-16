import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';
import {GA_CHART, GoogleData} from '../_models/GoogleData';

import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

@Injectable()
export class GoogleAnalyticsService {

  constructor(
    private http: HttpClient,
    private storeService: StoreService
  ) {
  }

  getViewList() {
    const headers = this.getAuthorization();
    return this.http.get(environment.protocol + environment.host + ':' + environment.port + '/ga/getViewList', {headers});
  }

  getData(ID): Observable<any> {
    const headers = this.getAuthorization();
    let call;

    switch (ID) {
      case GA_CHART.IMPRESSIONS_DAY:
        call = 'pageviews/';
        break;
      case GA_CHART.SESSION_DAY:
        call = 'sessions/';
        break;
      case GA_CHART.SOURCES_COLUMNS:
      case GA_CHART.SOURCES_PIE:
        call = 'sources/';
        break;
      case GA_CHART.MOST_VISITED_PAGES:
        call = 'mostviews/';
        break;
      case GA_CHART.BOUNCE_RATE:
        call = 'bouncerate/';
        break;
      case GA_CHART.AVG_SESS_DURATION:
        call = 'avgsessionduration/';
        break;
      case GA_CHART.BROWSER_SESSION:
        call = 'browsers/';
        break;
      case GA_CHART.NEW_USERS:
        call = 'newusers/';
        break;
      case GA_CHART.MOBILE_DEVICES:
        call = 'mobiledevices/';
        break;
      case GA_CHART.PAGE_LOAD_TIME:
        call = 'pageloadtime/';
        break;
      case GA_CHART.PERCENT_NEW_SESSION:
        call = 'percentnewsessions/';
        break;
    }

    return this.http.get<GoogleData[]>(this.formatURL(call), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  gaUsers(): Observable<any> {
    const headers = this.getAuthorization();

    return this.http.get<GoogleData[]>(this.formatURL('users/'), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  private formatURL( urlCall: string) {
    return environment.protocol + environment.host + ':' + environment.port + '/ga/' + urlCall;
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
