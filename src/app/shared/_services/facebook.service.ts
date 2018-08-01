import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FacebookFanCount, FaceBookFanCountry, FacebookImpressions} from '../_models/FacebookData';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';

// TODO Capire perché queste chiamate non vengano intercettate dall'interceptor

@Injectable()
export class FacebookService {

  constructor(private http: HttpClient, private storeService: StoreService) {
  }

  fbfancount() {
    const headers = this.getAuthorization();
    return this.http.get<FacebookFanCount[]>('http://' + environment.host + ':' + environment.port + '/fbfancount', {headers});
  }

  fbpageimpressions() {
    const headers = this.getAuthorization();
    return this.http.get<FacebookImpressions[]>('http://' + environment.host + ':' + environment.port + '/fbpageimpressions', {headers});
  }

  fbfancountry() {
    const headers = this.getAuthorization();
    return this.http.get<FaceBookFanCountry[]>('http://' + environment.host + ':' + environment.port + '/fbfancountry', {headers});
  }

  getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
