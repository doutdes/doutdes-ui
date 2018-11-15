import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';
import {
  GoogleAvgSessionDuration,
  GoogleBounceRate,
  GoogleBrowsers,
  GoogleMostViews, GoogleNewUsers,
  GooglePageViews, GooglePageViewsPerSession,
  GoogleSessions,
  GoogleSources,
  GoogleViewsByCountry
} from '../_models/GoogleData';
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

  gaPageViews(intervalDate: IntervalDate): Observable<any> {
    const headers = this.getAuthorization();

    return this.http.get<GooglePageViews>(this.getUrlFormatted(intervalDate, '/ga/pageviews/'), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  gaSessions(intervalDate: IntervalDate): Observable<any> {
    const headers = this.getAuthorization();

    return this.http.get<GoogleSessions>(this.getUrlFormatted(intervalDate, '/ga/sessions/'), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  gaSources(intervalDate: IntervalDate): Observable<any> {
    const headers = this.getAuthorization();

    return this.http.get<GoogleSources>(this.getUrlFormatted(intervalDate, '/ga/sources/'), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  gaMostViews(intervalDate: IntervalDate): Observable<any> {
    const headers = this.getAuthorization();

    return this.http.get<GoogleMostViews>(this.getUrlFormatted(intervalDate, '/ga/mostviews/'), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  gaViewsByCountry(intervalDate: IntervalDate): Observable<any> {
    const headers = this.getAuthorization();

    return this.http.get<GoogleViewsByCountry>(this.getUrlFormatted(intervalDate, '/ga/viewsbycountry/'), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  gaBrowsers(intervalDate: IntervalDate): Observable<any> {
    const headers = this.getAuthorization();

    return this.http.get<GoogleBrowsers>(this.getUrlFormatted(intervalDate, '/ga/browsers/'), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  gaBounceRate(intervalDate: IntervalDate): Observable<any> {
    const headers = this.getAuthorization();

    return this.http.get<GoogleBounceRate>(this.getUrlFormatted(intervalDate, '/ga/bouncerate/'), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  gaAvgSessionDuration(intervalDate: IntervalDate): Observable<any> {
    const headers = this.getAuthorization();

    return this.http.get<GoogleAvgSessionDuration>(this.getUrlFormatted(intervalDate, '/ga/avgsessionduration/'), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  gaPageViewsPerSession(intervalDate: IntervalDate): Observable<any> {
    const headers = this.getAuthorization();

    return this.http.get<GooglePageViewsPerSession>(this.getUrlFormatted(intervalDate, '/ga/pageviewspersession/'), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  gaNewUsers(intervalDate: IntervalDate): Observable<any> {
    const headers = this.getAuthorization();

    return this.http.get<GoogleNewUsers>(this.getUrlFormatted(intervalDate, '/ga/newusers/'), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  private getUrlFormatted(intervalDate: IntervalDate, urlCall: string) {
    const startDate = (intervalDate == undefined || intervalDate.dataStart == undefined || intervalDate.dataStart == null)
      ? '365daysAgo'
      : this.formatDate(intervalDate.dataStart);
    const endDate = (intervalDate == undefined || intervalDate.dataEnd == undefined || intervalDate.dataEnd == null)
      ? 'today'
      : this.formatDate(intervalDate.dataEnd);

    return 'http://' + environment.host + ':' + environment.port + urlCall + startDate + '/' + endDate + '/';
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
