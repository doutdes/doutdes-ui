import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Message} from '../_models/Message';
import {UserMessage} from '../_models/UserMessage';

import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';
import {IgPage} from '../_models/InstagramData';

@Injectable()
export class MessageService {
  constructor(private http: HttpClient, private storeService: StoreService) {
  }

  getMessageByID(id) {
    const headers = this.getAuthorization();
    return this.http.get<Message[]>(this.formatURL('id'), {headers});
  }


  private formatURL (call, pageID = null) {
    const aux = pageID ? (pageID + '/' + call) : call;
    return environment.protocol + environment.host + ':' + environment.port + '/message/' + aux;
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
