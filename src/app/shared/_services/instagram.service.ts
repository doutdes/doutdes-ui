import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {
  IgPage,
  IgData,
  IgNumberData, IG_CHART, IgMedia, IgBusinessInfo

} from '../_models/InstagramData';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';
import {FbData} from '../_models/FacebookData';
import {ChartParams} from '../_models/Chart';

// TODO Capire perché queste chiamate non vengano intercettate dall'interceptor

@Injectable()
export class InstagramService {
  private urlRequest = `${environment.protocol}${environment.host}:${environment.port}/ig/data`;

  constructor(private http: HttpClient, private storeService: StoreService) {
  }

  getPages() {
    const headers = this.getAuthorization();
    return this.http.get<IgPage[]>(this.formatURL('pages'), {headers});
  }

  getData(chartParams: ChartParams, pageID: string) {
    const headers = this.getAuthorization();
    const params = {
      page_id: pageID,
      metric: chartParams.metric,
      period: chartParams.period,
      interval: `${chartParams.interval}`
    };


    return this.http.get<IgData>(this.urlRequest, {headers, params});
  }

  getMedia(pageID, n=20) {
    const headers = this.getAuthorization();
    return this.http.get<IgMedia[]>(this.formatURL('media/' + n, pageID), {headers})
  }

  getBusinessInfo(pageID) {
    const headers = this.getAuthorization();
    return this.http.get<IgBusinessInfo>(this.formatURL('businessInfo/', pageID), {headers})
  }

  private formatURL (call, pageID = null) {
    const aux = pageID ? (pageID + '/' + call) : call;
    return environment.protocol + environment.host + ':' + environment.port + '/ig/' + aux;
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
