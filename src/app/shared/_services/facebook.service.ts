import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FacebookFanCount, FaceBookFanCountry, FacebookImpressions, FacebookPageViewsTotal} from '../_models/FacebookData';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';

// TODO Capire perché queste chiamate non vengano intercettate dall'interceptor

@Injectable()
export class FacebookService {

  constructor(private http: HttpClient, private storeService: StoreService) {
  }

  fbfancount() {
    const headers = this.getAuthorization();
    return this.http.get<FacebookFanCount[]>('http://' + environment.host + ':' + environment.port + '/fb/fancount', {headers});
  }

  fbpageimpressions() {
    const headers = this.getAuthorization();
    return this.http.get<FacebookImpressions[]>('http://' + environment.host + ':' + environment.port + '/fb/pageimpressions', {headers});
  }

  fbfancountry() {
    const headers = this.getAuthorization();
    return this.http.get<FaceBookFanCountry[]>('http://' + environment.host + ':' + environment.port + '/fb/fancountry', {headers});
  }

  fbpageviewstotal() {
    const headers = this.getAuthorization();
    return this.http.get<FacebookPageViewsTotal[]>('http://' + environment.host + ':' + environment.port + '/fb/pageviewstotal', {headers});
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
