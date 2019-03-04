import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {
  FbPage,
  FbAnyData,
  FbNumberData
} from '../_models/FacebookData';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';

// TODO Capire perché queste chiamate non vengano intercettate dall'interceptor

@Injectable()
export class FacebookService {

  constructor(private http: HttpClient, private storeService: StoreService) {
  }

  getPages() {
    const headers = this.getAuthorization();
    return this.http.get<FbPage[]>(this.formatURL('pages'), {headers});
  }

  ///TODO: riorganizzare ID per rendere switch case in charts_call coerente
  /*getAnyData(pageID, ID)
  {
    const headers = this.getAuthorization();
    switch (ID)
    {
    }
  }

  getNumericData(pageID, ID)
  {
    const headers = this.getAuthorization();
    switch (ID)
    {
    }
  }
*/
  fbposts(pageID) {
    const headers = this.getAuthorization();
    return this.http.get<FbAnyData[]>(this.formatURL('posts', pageID), {headers});
  }

  fbfancount(pageID) {
    const headers = this.getAuthorization();
    return this.http.get<FbNumberData[]>(this.formatURL('fancount', pageID), {headers});
  }

  fbpageimpressions(pageID) {
    const headers = this.getAuthorization();
    return this.http.get<FbNumberData[]>(this.formatURL('pageimpressions', pageID), {headers});
  }

  fbpagereactions(pageID) {
    const headers = this.getAuthorization();
    return this.http.get<FbNumberData[]>(this.formatURL('pagereactions', pageID), {headers});
  }

  fbfancountry(pageID) {
    const headers = this.getAuthorization();
    return this.http.get<FbAnyData[]>(this.formatURL('fancountry', pageID), {headers});
  }

  fbpageviewstotal(pageID) {
    const headers = this.getAuthorization();
    return this.http.get<FbNumberData[]>(this.formatURL('pageviewstotal', pageID), {headers});
  }

  fbfancity(pageID) {
    const headers = this.getAuthorization();
    return this.http.get<FbAnyData[]>(this.formatURL('fancity', pageID), {headers});
  }

  private formatURL(call, pageID= null) {
    const aux = pageID ? (pageID + '/' + call) : call;
    return 'http://' + environment.host + ':' + environment.port + '/fb/' + aux;
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
