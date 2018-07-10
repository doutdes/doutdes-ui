import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FacebookFanCount, FacebookImpressions} from '../_models/FacebookData';

@Injectable()
export class FacebookService {

  constructor(private http: HttpClient) {
  }

  fbfancount() {
    return this.http.get<FacebookFanCount[]>('http://localhost:3000/fbfancount');
  }

  fbpageimpressions() {
    return this.http.get<FacebookImpressions[]>('http://localhost:3000/fbpageimpressions');
  }
}
