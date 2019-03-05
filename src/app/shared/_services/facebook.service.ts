import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {
  FbPage,
  FbAnyData,
  FbNumberData, FbPost, FB_CHART
} from '../_models/FacebookData';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';

// TODO Capire perché queste chiamate non vengano intercettate dall'interceptor

@Injectable()
export class FacebookService {

  constructor(private http: HttpClient, private storeService: StoreService) {
  }

  getPages() {
    const headers = this.getAuthorization();
    return this.http.get<FbPage[]>(this.formatURL('pages'), {headers});
  }

  getData(ID, pageID) {
    const headers = this.getAuthorization();
    let call;
    let anyType = false;

    switch (ID) {
      case FB_CHART.FANS_COUNTRY_GEOMAP:
      case FB_CHART.FANS_COUNTRY_PIE:
        call = 'fancountry';
        anyType = true;
        break;
      case FB_CHART.FANS_CITY:
        call = 'fancity';
        anyType = true;
        break;
      case FB_CHART.FANS_DAY:
        call = 'fancount';
        break;
      case FB_CHART.IMPRESSIONS:
        call = 'pageimpressions';
        break;
      case FB_CHART.PAGE_VIEWS:
        call = 'pageviewstotal';
        break;
    }

    return anyType
      ? this.http.get<FbAnyData[]>(this.formatURL(call, pageID), {headers})
      : this.http.get<FbNumberData[]>(this.formatURL(call, pageID), {headers});
  }

  fbposts(pageID) {
    const headers = this.getAuthorization();
    return this.http.get<FbPost[]>(this.formatURL('posts', pageID), {headers});
  }

  fbpagereactions(pageID) {
    const headers = this.getAuthorization();
    return this.http.get<FbNumberData[]>(this.formatURL('pagereactions', pageID), {headers});
  } // TODO give an ID on the database

  private formatURL(call, pageID = null) {
    const aux = pageID ? (pageID + '/' + call) : call;
    return 'http://' + environment.host + ':' + environment.port + '/fb/' + aux;
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
