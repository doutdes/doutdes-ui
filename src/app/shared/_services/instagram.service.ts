import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {
  IgPage,
  IgAnyData,
  IgNumberData, IG_CHART, IgMedia, IgBusinessInfo

} from '../_models/InstagramData';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';

// TODO Capire perché queste chiamate non vengano intercettate dall'interceptor

@Injectable()
export class InstagramService {
  constructor(private http: HttpClient, private storeService: StoreService) {
  }

  getPages() {
    const headers = this.getAuthorization();
    return this.http.get<IgPage[]>(this.formatURL('pages'), {headers});
  }

  getData(ID, pageID) {
    const headers = this.getAuthorization();
    let call;
    let anyType = true;

    switch (ID) {
      case IG_CHART.AUD_CITY:
        call = 'audcity';
        break;
      case IG_CHART.AUD_COUNTRY:
        call = 'audcountry';
        break;
      case IG_CHART.AUD_GENDER_AGE:
        call = 'audgenderage';
        break;
      case IG_CHART.AUD_LOCALE:
        call = 'audlocale';
        break;
      case IG_CHART.ONLINE_FOLLOWERS:
        call = 'onlinefollowers';
        break;
      case IG_CHART.EMAIL_CONTACTS:
        call = 'emailcontacts';
        anyType = false;
        break;
      case IG_CHART.FOLLOWER_COUNT:
        call = 'followerCount';
        anyType = false;
        break;
      case IG_CHART.DIR_CLICKS:
        call = 'getdirclicks';
        anyType = false;
        break;
      case IG_CHART.IMPRESSIONS:
        call = 'impressions';
        anyType = false;
        break;
      case IG_CHART.PHONE_CALL_CLICKS:
        call = 'phonecallclicks';
        anyType = false;
        break;
      case IG_CHART.PROFILE_VIEWS:
        call = 'profileviews';
        anyType = false;
        break;
      case IG_CHART.REACH:
        call = 'reach';
        anyType = false;
        break;
      case IG_CHART.TEXT_MESSAGE_CLICKS:
        call = 'textmessageclicks';
        anyType = false;
        break;
      case IG_CHART.WEBSITE_CLICKS:
        call = 'websiteclicks';
        anyType = false;
        break;
      case IG_CHART.CLICKS_DISTRIBUTION:
        call = 'composedclicks';
        anyType = false;
        break;
    }

    return anyType
      ? this.http.get<IgAnyData[]>(this.formatURL(call, pageID), {headers})
      : this.http.get<IgNumberData[]>(this.formatURL(call, pageID), {headers});
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
    return 'http://' + environment.host + ':' + environment.port + '/ig/' + aux;
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
