import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';
import {YT_CHART, YoutubeData} from '../_models/YoutubeData';

import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {IntervalDate} from '../../features/dashboard/redux-filter/filter.model';
import {IgPage} from '../_models/InstagramData';
import * as moment from 'moment';
import {D_TYPE} from '../_models/Dashboard';

@Injectable()
export class YoutubeService {

  constructor(private http: HttpClient, private storeService: StoreService) {
  }

  getChannels() {
    const headers = this.getAuthorization();
    return this.http.get<IgPage[]>(this.formatURL(null, 'channels'), {headers});
  }

  getVideos(pageIDs) {
    const headers = this.getAuthorization();
    return this.http.get<IgPage[]>(this.formatURL(null, pageIDs+'/videos'), {headers});
  }

  getSubscribers(pageIDs) {
    const headers = this.getAuthorization();
    return this.http.get<IgPage[]>(this.formatURL(null, pageIDs+'/subscribers'), {headers});
  }



  getData(ID, intervalDate, pageID): Observable<any> {
    const headers = this.getAuthorization();
    let call;

    switch (ID) {
      case YT_CHART.VIEWS:
        call = 'views';
        break;
      case YT_CHART.COMMENTS:
        call = 'comments';
        break;
      case YT_CHART.LIKES:
        call = 'likes';
        break;
      case YT_CHART.DISLIKES:
        call = 'dislikes';
        break;
      case YT_CHART.SHARES:
        call = 'shares';
        break;
      case YT_CHART.AVGVIEW:
        call = 'avgView';
        break;
      case YT_CHART.ESTWATCH:
        call = 'estWatch';
        break;
    }

    return this.http.get<YoutubeData[]>(this.formatURL(intervalDate, pageID + '/' + call), {headers})
      .pipe(map((res) => res), catchError(e => of(e)));
  }

  private formatURL(intervalDate: IntervalDate, urlCall: string) {
    /*if(intervalDate == null)
      return environment.protocol + environment.host + ':' + environment.port + '/yt/' + urlCall;

    const startDate = (intervalDate == undefined || intervalDate.first == undefined || intervalDate.last == null)
      ? '90daysAgo'
      : this.formatDate(intervalDate.first);
    const endDate = (intervalDate == undefined || intervalDate.last == undefined || intervalDate.last == null)
      ? 'today'
      : this.formatDate(intervalDate.last);
*/
      return environment.protocol + environment.host + ':' + environment.port + '/yt/' + urlCall + '/';

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
