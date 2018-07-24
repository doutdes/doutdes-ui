import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FacebookFanCount, FaceBookFanCountry, FacebookImpressions} from '../_models/FacebookData';

@Injectable()
export class FacebookService {

  constructor(private http: HttpClient) {
  }

  fbfancount() {
    return this.http.get<FacebookFanCount[]>('http://www.doutdes-cluster.it:3000/fbfancount');
  }

  fbpageimpressions() {
    return this.http.get<FacebookImpressions[]>('http://www.doutdes-cluster.it:3000/fbpageimpressions');
  }

  fbfancountry(){
    return this.http.get<FaceBookFanCountry[]>('http://www.doutdes-cluster.it:3000/fbfancountry');
  }
}
