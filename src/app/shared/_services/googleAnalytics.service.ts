import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';
import {GoogleData} from '../_models/GoogleData';

import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ChartParams} from '../_models/Chart';
import {ViewGoogle} from '../_models/GoogleData';

@Injectable()
export class GoogleAnalyticsService {
  private urlRequest = `${environment.protocol}${environment.host}:${environment.port}/ga/data`;

  constructor(
    private http: HttpClient,
    private storeService: StoreService
  ) {
  }

  getViewList() {
    const headers = this.getAuthorization();
    return this.http.get<ViewGoogle[]>(environment.protocol + environment.host + ':' + environment.port + '/ga/getViewList', {headers});
  }

  getData(chartParams: ChartParams): Observable<any> {
    const headers = this.getAuthorization();
    const params = {};

    for (const el of Object.keys(chartParams)) {
      params[el] = chartParams[el];
    }

    return this.http.get<GoogleData[]>(this.urlRequest, {headers, params})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  gaUsers(): Observable<any> {
    const headers = this.getAuthorization();

    return this.http.get<GoogleData[]>(this.formatURL('users/'), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  private formatURL(urlCall: string) {
    return environment.protocol + environment.host + ':' + environment.port + '/ga/' + urlCall;
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
