import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';
import {GoogleData, GoogleDataWithDate, GoogleMostViews, GooglePageViews, GoogleSessions, GoogleSources} from '../_models/GoogleData';
import {IntervalDate} from '../../features/dashboard/redux-filter/filter.model';

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

    return this.http.get<GoogleSources>(this.getUrlFormatted(intervalDate, '/ga/sessions/'), {headers});
  }

  gaMostViews(intervalDate: IntervalDate) {
    const headers = this.getAuthorization();

    return this.http.get<GoogleMostViews>(this.getUrlFormatted(intervalDate, '/ga/sessions/'), {headers});
  }

  private getUrlFormatted(intervalDate: IntervalDate, urlCall: string){
    const startDate = (intervalDate == undefined || intervalDate.dataStart == undefined || intervalDate.dataStart == null) ? '365daysAgo' : intervalDate.dataStart;
    const endDate = (intervalDate == undefined || intervalDate.dataEnd == undefined || intervalDate.dataStart == null) ? 'today' : intervalDate.dataEnd;

    return 'http://' + environment.host + ':' + environment.port + urlCall + startDate + '/' + endDate + '/';
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }

}
