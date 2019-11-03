import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {StoreService} from './store.service';
import {environment} from '../../../environments/environment';
import {FBC_CHART, FbcAnyData, FbcPage} from '../_models/FacebookCampaignsData';

@Injectable()
export class FacebookCampaignsService {

  constructor(
    private http: HttpClient,
    private storeService: StoreService) {
  }

  // Here they will be the various back-end calls (insights, campaings, etc.)

  private getAuthorization = (): HttpHeaders =>
    new HttpHeaders()
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`)

  getData(ID, pageID, idCampaign) {
    const headers = this.getAuthorization();
    let call;
    switch (ID) {
      case FBC_CHART.CAMPAIGNS:
        call = 'campaigns';
        break;
      case FBC_CHART.ADSETS:
        call = 'adsets/' + idCampaign;
        break;
      case FBC_CHART.ADS:
        call = 'ads/' + idCampaign;
        break;
    }

    return this.http.get<FbcAnyData[]>(this.formatURL(call, pageID), {headers});
  }

  getPages() {
    const headers = this.getAuthorization();
    return this.http.get<FbcPage[]>(this.formatURL('pages'), {headers});
  }

  private formatURL(call, pageID = null) {
    const aux = pageID ? (pageID + '/' + call) : call;
    return environment.protocol + environment.host + ':' + environment.port + '/fbm/' + aux;
  }

}
