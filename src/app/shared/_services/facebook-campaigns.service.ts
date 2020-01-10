import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {StoreService} from './store.service';
import {environment} from '../../../environments/environment';
import {FBC_CHART, FbcAnyData, FbcPage} from '../_models/FacebookCampaignsData';
import {ChartParams} from '../_models/Chart';
import {FbmAnyData} from '../_models/FacebookMarketingData';

@Injectable()
export class FacebookCampaignsService {
  private urlRequest = `${environment.protocol}${environment.host}:${environment.port}/fbm`;

  constructor(
    private http: HttpClient,
    private storeService: StoreService) {
  }

  private getAuthorization = (): HttpHeaders =>
    new HttpHeaders()
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`)

  getData(chartParams: ChartParams, pageID: string) {
    const headers = this.getAuthorization();

    const params = {
      metric: chartParams.metric || null,
      breakdowns: chartParams.breakdowns || null,
      domain: chartParams.domain,
      page_id: pageID,
      campaignsId: chartParams.campaignsId || null
    };

    return this.http.get<FbcAnyData>(`${this.urlRequest}/data`, {headers, params});
  }

  getPages() {
    const headers = this.getAuthorization();
    return this.http.get<FbcPage[]>(`${this.urlRequest}/pages`, {headers});  }

  /*private formatURL(call, pageID = null) {
    const aux = pageID ? (pageID + '/' + call) : call;
    return environment.protocol + environment.host + ':' + environment.port + '/fbm/' + aux;
  }*/
}
