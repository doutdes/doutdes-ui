import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FbPage, FbData, FbPost} from '../_models/FacebookData';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';

@Injectable()
export class FacebookService {
  private urlRequest = `${environment.protocol}${environment.host}:${environment.port}/fb`;

  constructor(
    private http: HttpClient,
    private storeService: StoreService
  ) {
  }

  getPages() {
    const headers = this.getAuthorization();
    return this.http.get<FbPage[]>(`${this.urlRequest}/pages`, {headers});
  }

  getData(metric: string, pageID: string) {
    const headers = this.getAuthorization();
    const params = {
      metric: metric,
      page_id: pageID
    };

    return this.http.get<FbData>(`${this.urlRequest}/data`, {headers, params});
  }

  fbPosts(pageID) {
    const headers = this.getAuthorization();
    const params = {
      page_id: pageID
    };
    return this.http.get<FbPost[]>(`${this.urlRequest}/posts`, {headers, params});
  }

  private getAuthorization = () => new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('Authorization', `Bearer ${this.storeService.getToken()}`);
}
