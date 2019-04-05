import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';
import {GA_CHART, GoogleData} from '../_models/GoogleData';

import {IntervalDate} from '../../features/dashboard/redux-filter/filter.model';
import * as moment from 'moment';
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

  getData(ID, intervalDate: IntervalDate): Observable<any> {
    const headers = this.getAuthorization();
    let call;
    let withDate = true;

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
        // withDate = false;
        break;
      case GA_CHART.MOST_VISITED_PAGES:
        call = 'mostviews/';
        // withDate = false;/
        break;
      case GA_CHART.BOUNCE_RATE:
        call = 'bouncerate/';
        break;
      case GA_CHART.AVG_SESS_DURATION:
        call = 'avgsessionduration/';
        break;
      case GA_CHART.BROWSER_SESSION:
        call = 'browsers/';
        // withDate = false;
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

    return this.http.get<GoogleData[]>(this.formatURL(intervalDate, call), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  getScopes() {
    const headers = this.getAuthorization();
    return this.http.get(environment.protocol + environment.host + ':' + environment.port + '/getScopes/', {headers});
  }

  gaViewsByCountry(intervalDate: IntervalDate): Observable<any> {
    const headers = this.getAuthorization();

    return this.http.get<GoogleData[]>(this.formatURL(intervalDate, 'viewsbycountry/'), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  gaUsers(intervalDate: IntervalDate): Observable<any> {
    const headers = this.getAuthorization();

    return this.http.get<GoogleData[]>(this.formatURL(intervalDate, 'users/'), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  gaNewUsers(intervalDate: IntervalDate): Observable<any> {
    const headers = this.getAuthorization();

    return this.http.get<GoogleData[]>(this.formatURL(intervalDate, 'newusers/'), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  private formatURL(intervalDate: IntervalDate, urlCall: string) {
    const startDate = (intervalDate == undefined || intervalDate.first == undefined || intervalDate.last == null)
      ? '90daysAgo'
      : this.formatDate(intervalDate.first);
    const endDate = (intervalDate == undefined || intervalDate.last == undefined || intervalDate.last == null)
      ? 'today'
      : this.formatDate(intervalDate.last);

    return environment.protocol + environment.host + ':' + environment.port + '/ga/' + urlCall + startDate + '/' + endDate + '/';
  }

  private formatDate(date: Date) {
    return moment(date).format('YYYY-MM-DD');
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }

}
