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

@Injectable()
export class InstagramService {
  private urlRequest = `${environment.protocol}${environment.host}:${environment.port}/ig`;

  constructor(
    private http: HttpClient,
    private storeService: StoreService
  ) {
  }

  getPages() {
    const headers = this.getAuthorization();
    return this.http.get<IgPage[]>(`${this.urlRequest}/pages`, {headers});
  }

  getData(chartParams: ChartParams, pageID: string) {
    const headers = this.getAuthorization();
    const params = {
      ...chartParams,
      page_id: pageID,
      interval: `${chartParams.interval}`,
    };

    return this.http.get<IgData>(`${this.urlRequest}/data`, {headers, params});
  }

  getMedia(pageID) {
    const headers = this.getAuthorization();
    const path = pageID ? `${pageID}/media` : 'media';
    return this.http.get<IgMedia[]>(`${this.urlRequest}/${path}`, {headers});
  }

  getBusinessInfo(pageID) {
    const headers = this.getAuthorization();
    const params = {page_id: pageID};
    return this.http.get<IgBusinessInfo>(`${this.urlRequest}/businessInfo`, {headers, params});
  }

  private getAuthorization = () => new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('Authorization', `Bearer ${this.storeService.getToken()}`);
}
