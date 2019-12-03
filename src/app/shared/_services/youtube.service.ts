import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';
import {YoutubeData, YT_CHART, YtPage} from '../_models/YoutubeData';

import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {IntervalDate} from '../../features/dashboard/redux-filter/filter.model';
import {FbData} from '../_models/FacebookData';

@Injectable()
export class YoutubeService {
  private urlRequest = `${environment.protocol}${environment.host}:${environment.port}/yt`;

  constructor(private http: HttpClient, private storeService: StoreService) {
  }

  getChannels() {
    const headers = this.getAuthorization();
    return this.http.get<YtPage[]>(`${this.urlRequest}/channels`, {headers});
  }


  getData(metric: string, channel_id: string) {
    const headers = this.getAuthorization();
    const params = {
      metric: metric,
      channel_id: channel_id
    };

    return this.http.get<Array<YoutubeData>>(`${this.urlRequest}/data`, {headers, params});
  }

  // Get videos === video on the metric of getData
  // Get subs === info on the metric of getData
  // Get viewList === getChannels

/*
  getVideos(pageIDs) {
    const headers = this.getAuthorization();
    return this.http.get<YoutubeData[]>(this.formatURL(null, pageIDs + '/videos'), {headers});
  }

  getSubscribers(pageIDs) {
    const headers = this.getAuthorization();
    return this.http.get<YtPage[]>(this.formatURL(null, pageIDs + '/subscribers'), {headers});
  }

  getViewList() {
    const headers = this.getAuthorization();
    return this.http.get(environment.protocol + environment.host + ':' + environment.port + '/yt/getViewList', {headers});
  }

  private formatURL(intervalDate: IntervalDate, urlCall: string) {
    return environment.protocol + environment.host + ':' + environment.port + '/yt/' + urlCall + '/';

  }
*/


  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }

}
