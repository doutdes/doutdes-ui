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
      case FB_CHART.ENGAGED_USERS:
        call = 'engageduser';
        break;
      case FB_CHART.PAGE_CONSUMPTION:
        call = 'pageconsumptions';
        break;
      case FB_CHART.PAGE_PLACES_CHECKIN:
        call = 'placescheckin';
        break;
      case FB_CHART.NEGATIVE_FEEDBACK:
        call = 'negativefeedback';
        break;
      case FB_CHART.ONLINE_FANS:
        call = 'fansonlineperday';
        break;
      case FB_CHART.FANS_ADD:
        call = 'fansadds';
        break;
      case FB_CHART.FANS_REMOVES:
        call = 'fanremoves';
        break;
      case FB_CHART.IMPRESSIONS_PAID:
        call = 'pageimpressionspaid';
        break;
      case FB_CHART.PAGE_VIEWS:
        call = 'videoviews';
        break;
      case FB_CHART.VIDEO_ADS:
        call = 'videoads';
        break;
      case FB_CHART.VIDEO_VIEWS:
        call = 'videoviews';
        break;
      case FB_CHART.POST_IMPRESSIONS:
        call = 'postimpressions';
        break;
      case FB_CHART.REACTIONS_LINEA:
      case FB_CHART.REACTIONS_COLUMN_CHART:
      case FB_CHART.REACTIONS:
        call = 'pagereactions';
        break;
      case FB_CHART.PAGE_VIEW_EXTERNALS_LINEA:
      case FB_CHART.PAGE_VIEW_EXTERNALS:
        call = 'pageviewsexternals';
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
    return environment.protocol + environment.host + ':' + environment.port + '/fb/' + aux;
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
