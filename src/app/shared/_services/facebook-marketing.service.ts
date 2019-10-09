import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {StoreService} from './store.service';
import {environment} from '../../../environments/environment';
import {FBM_CHART, FbmAnyData, FbmPage} from '../_models/FacebookMarketingData';
import {FbPage} from '../_models/FacebookData';

@Injectable()
export class FacebookMarketingService {

  constructor(
    private http: HttpClient,
    private storeService: StoreService) {
  }

  // Here they will be the various back-end calls (insights, campaings, etc.)

  private getAuthorization = (): HttpHeaders =>
    new HttpHeaders()
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`)

  getData(ID, pageID) {
    const headers = this.getAuthorization();
    let call;

    switch (ID) {
      case FBM_CHART:
        call = 'insights';
        break;
      case FBM_CHART.AGE_REACH:
      case FBM_CHART.AGE_IMPRESSIONS:
      case FBM_CHART.AGE_INLINE:
      case FBM_CHART.AGE_CLICKS:
      case FBM_CHART.AGE_CTR:
      case FBM_CHART.AGE_CPP:
      case FBM_CHART.AGE_CPC:
      case FBM_CHART.AGE_SPEND:
        call = 'insights/breakdowns/age';
        break;

      case FBM_CHART.GENDER_REACH:
      case FBM_CHART.GENDER_IMPRESSIONS:
      case FBM_CHART.GENDER_INLINE:
      case FBM_CHART.GENDER_CLICKS:
      case FBM_CHART.GENDER_CTR:
      case FBM_CHART.GENDER_CPP:
      case FBM_CHART.GENDER_CPC:
      case FBM_CHART.GENDER_SPEND:
        call = 'insights/breakdowns/gender';
        break;
      case FBM_CHART.GENDER_AGE_REACH:
      case FBM_CHART.GENDER_AGE_IMPRESSIONS:
      case FBM_CHART.GENDER_AGE_INLINE:
      case FBM_CHART.GENDER_AGE_CLICKS:
      case FBM_CHART.GENDER_AGE_CTR:
      case FBM_CHART.GENDER_AGE_CPP:
      case FBM_CHART.GENDER_AGE_CPC:
      case FBM_CHART.GENDER_AGE_SPEND:
        call = 'insights/breakdowns/genderAge';
        break;
      case FBM_CHART.COUNTRYREGION_CLICKS:
      case FBM_CHART.COUNTRYREGION_CPC:
      case FBM_CHART.COUNTRYREGION_CPP:
      case FBM_CHART.COUNTRYREGION_CTR:
      case FBM_CHART.COUNTRYREGION_IMPRESSIONS:
      case FBM_CHART.COUNTRYREGION_INLINE:
      case FBM_CHART.COUNTRYREGION_SPEND:
      case FBM_CHART.COUNTRYREGION_REACH:
        call = 'insights/breakdowns/countryRegion';
        break;
      case FBM_CHART.HOURLYADVERTISER_IMPRESSIONS:
      case FBM_CHART.HOURLYADVERTISER_SPEND:
      case FBM_CHART.HOURLYADVERTISER_INLINE:
      case FBM_CHART.HOURLYADVERTISER_CLICKS:
      case FBM_CHART.HOURLYADVERTISER_CPC:
      case FBM_CHART.HOURLYADVERTISER_CTR:
        call = 'insights/breakdowns/hourlyAdvertiser';
        break;
      case FBM_CHART.HOURLYAUDIENCE_REACH:
      case FBM_CHART.HOURLYAUDIENCE_IMPRESSIONS:
      case FBM_CHART.HOURLYAUDIENCE_SPEND:
      case FBM_CHART.HOURLYAUDIENCE_CLICKS:
      case FBM_CHART.HOURLYAUDIENCE_INLINE:
      case FBM_CHART.HOURLYAUDIENCE_CPC:
      case FBM_CHART.HOURLYAUDIENCE_CPP:
      case FBM_CHART.HOURLYAUDIENCE_CTR:
        call = 'insights/breakdowns/hourlyAudience';
        break;
    }

    return this.http.get<FbmAnyData[]>(this.formatURL(call, pageID), {headers});

  }

  getPages() {
    const headers = this.getAuthorization();
    return this.http.get<FbmPage[]>(this.formatURL('pages'), {headers});
  }

  private formatURL(call, pageID = null) {
    const aux = pageID ? (pageID + '/' + call) : call;
    return environment.protocol + environment.host + ':' + environment.port + '/fbm/' + aux;
  }

}
