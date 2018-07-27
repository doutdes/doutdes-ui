import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FacebookFanCount, FaceBookFanCountry, FacebookImpressions} from '../_models/FacebookData';
import {environment} from '../../../environments/environment';

@Injectable()
export class FacebookService {

  constructor(private http: HttpClient) {
  }

  fbfancount() {
    return this.http.get<FacebookFanCount[]>('http://' + environment.host + ':' + environment.port + '/fbfancount');
  }

  fbpageimpressions() {
    return this.http.get<FacebookImpressions[]>('http://' + environment.host + ':' + environment.port + '/fbpageimpressions');
  }

  fbfancountry(){
    return this.http.get<FaceBookFanCountry[]>('http://' + environment.host + ':' + environment.port + '/fbfancountry');
  }
}
