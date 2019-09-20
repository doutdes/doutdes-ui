import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {
  FbPage,
  FbData,
  FbNumberData,
  FbPost
} from '../_models/FacebookData';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';

// TODO Capire perché queste chiamate non vengano intercettate dall'interceptor

@Injectable()
export class FacebookService {
  private urlRequest = `${environment.protocol}${environment.host}:${environment.port}/fb/data`;

  constructor(
    private http: HttpClient,
    private storeService: StoreService
  ) {
  }

  getPages() {
    const headers = this.getAuthorization();
    return this.http.get<FbPage[]>(this.formatURL('pages'), {headers});
  }

  getData(metric: string, pageID: string) {
    const headers = this.getAuthorization();
    const params = {
      metric: metric,
      page_id: pageID
    };

    return this.http.get<FbData>(this.urlRequest, {headers, params});
  }

  fbposts(pageID) {
    const headers = this.getAuthorization();
    return this.http.get<FbPost[]>(this.formatURL('posts', pageID), {headers});
  }

  fbpagereactions(pageID) {
    const headers = this.getAuthorization();
    return this.http.get<FbNumberData[]>(this.formatURL('pagereactions', pageID), {headers});
  } // TODO give an ID on the database

  private formatURL(call, pageID = null) {
    const aux = pageID ? (pageID + '/' + call) : call;
    return environment.protocol + environment.host + ':' + environment.port + '/fb/' + aux;
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
