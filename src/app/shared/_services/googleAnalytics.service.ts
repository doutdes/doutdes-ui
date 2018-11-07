import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';
import {GoogleData, GoogleDataWithDate, GoogleMostViews, GooglePageViews, GoogleSessions, GoogleSources} from '../_models/GoogleData';
import {IntervalDate} from '../../features/dashboard/redux-filter/filter.model';
import * as moment from 'moment';

@Injectable()
export class GoogleAnalyticsService {

  constructor(
    private http: HttpClient,
    private storeService: StoreService
  ) {
  }

  gaPageViews(intervalDate: IntervalDate) {
    const headers = this.getAuthorization();

    return this.http.get<GooglePageViews>(this.getUrlFormatted(intervalDate, '/ga/pageviews/'), {headers});
  }

  gaSessions(intervalDate: IntervalDate) {
    const headers = this.getAuthorization();

    return this.http.get<GoogleSessions>(this.getUrlFormatted(intervalDate, '/ga/sessions/'), {headers});
  }

  gaSources(intervalDate: IntervalDate) {
    const headers = this.getAuthorization();

    return this.http.get<GoogleSources>(this.getUrlFormatted(intervalDate, '/ga/sources/'), {headers});
  }

  gaMostViews(intervalDate: IntervalDate) {
    const headers = this.getAuthorization();

    return this.http.get<GoogleMostViews>(this.getUrlFormatted(intervalDate, '/ga/mostviews/'), {headers});
  }

  private getUrlFormatted(intervalDate: IntervalDate, urlCall: string){
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
