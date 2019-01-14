import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FacebookFanCity, FacebookFanCount, FaceBookFanCountry, FacebookImpressions, FacebookPageViewsTotal} from '../_models/FacebookData';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';

// TODO Capire perché queste chiamate non vengano intercettate dall'interceptor

@Injectable()
export class FacebookService {

  constructor(private http: HttpClient, private storeService: StoreService) {
  }

  pages() {
    const headers = this.getAuthorization();
    return this.http.get<FacebookFanCount[]>(this.formatURL('pages'), {headers});
  }

  fbfancount(pageID) {
    const headers = this.getAuthorization();
    return this.http.get<FacebookFanCount[]>(this.formatURL('fancount', pageID), {headers});
  }

  fbpageimpressions(pageID) {
    const headers = this.getAuthorization();
    return this.http.get<FacebookImpressions[]>(this.formatURL('pageimpressions', pageID), {headers});
  }

  fbfancountry(pageID) {
    const headers = this.getAuthorization();
    return this.http.get<FaceBookFanCountry[]>(this.formatURL('fancountry', pageID), {headers});
  }

  fbpageviewstotal(pageID) {
    const headers = this.getAuthorization();
    return this.http.get<FacebookPageViewsTotal[]>(this.formatURL('pageviewstotal', pageID), {headers});
  }

  fbfancity(pageID){
    const headers = this.getAuthorization();
    return this.http.get<FacebookFanCity[]>(this.formatURL('fancity', pageID), {headers});
  }

  private formatURL(call, pageID=null) {
    const aux = pageID ? (pageID + '/' + call) : call;
    return 'http://' + environment.host + ':' + environment.port + '/fb/' + aux;
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
