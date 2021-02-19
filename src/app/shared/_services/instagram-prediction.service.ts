import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';

@Injectable({
  providedIn: 'root'
})
export class InstagramPredictionService {

  constructor(private http: HttpClient, private storeService: StoreService) {
  }

  concatenationStrings(username: String, day_publication: number, month_publication: number, time_publication: number,
  isVideo: boolean, description: String, page_id: String) {
    const headers = this.getAuthorization();
    return this.http.post(this.formatURL('concatenationStrings'), {username: username,
    day_publication: day_publication, month_publication: month_publication, time_publication: time_publication,
    isVideo: isVideo, description: description, page_id: page_id}, {headers});
  }

  private formatURL(call): string {
    return environment.protocol + environment.host + ':' + environment.port + '/prediction/' + call;
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
