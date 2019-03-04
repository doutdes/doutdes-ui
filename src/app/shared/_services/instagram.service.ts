import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {
  IgPage,
  IgAnyData,
  IgNumberData

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

  getAnyData(pageID, ID) {
    const headers = this.getAuthorization();
    switch (ID) {
      case 15:
        return this.http.get<IgAnyData[]>(this.formatURL('audcity', pageID), {headers});
      case 16:
        return this.http.get<IgAnyData[]>(this.formatURL('audcountry', pageID), {headers});
      case 17:
        return this.http.get<IgAnyData[]>(this.formatURL('audgenderage', pageID), {headers});
      case 18:
        return this.http.get<IgAnyData[]>(this.formatURL('audlocale', pageID), {headers});
      case 19:
        return this.http.get<IgAnyData[]>(this.formatURL('onlinefollowers', pageID), {headers});
      default:
        console.log('The data you are trying to fetch are not generic, try the other method');
    }
  }
  getNumericData(pageID, ID) {
    const headers = this.getAuthorization();
    switch (ID) {
      case 20:
        return this.http.get<IgNumberData[]>(this.formatURL('emailcontacts', pageID), {headers});
      case 21:
        return this.http.get<IgNumberData[]>(this.formatURL('followerCount', pageID), {headers});
      case 22:
        return this.http.get<IgNumberData[]>(this.formatURL('getdirclicks', pageID), {headers});
      case 23:
        return this.http.get<IgNumberData[]>(this.formatURL('impressions', pageID), {headers});
      case 24:
        return this.http.get<IgNumberData[]>(this.formatURL('phonecallclicks', pageID), {headers});
      case 25:
        return this.http.get<IgNumberData[]>(this.formatURL('profileviews', pageID), {headers});
      case 26:
        return this.http.get<IgNumberData[]>(this.formatURL('reach', pageID), {headers});
      case 27:
        return this.http.get<IgNumberData[]>(this.formatURL('textmessageclicks', pageID), {headers});
      case 28:
        return this.http.get<IgNumberData[]>(this.formatURL('websiteclicks', pageID), {headers});
      case 29:
        return this.http.get<IgNumberData[]>(this.formatURL('composedclicks', pageID), {headers});
      default:
        console.log('The data you are trying to fetch are not numeric, try the other method');

    }
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
