import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Message} from '../_models/Message';
import {UserMessage} from '../_models/UserMessage';

import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';


@Injectable()
export class MessageService {
  constructor(private http: HttpClient, private storeService: StoreService) {
  }

  getMessageByID(id) {
    const headers = this.getAuthorization();
    return this.http.get<Message>(this.formatURL('getMessageByID/' + id), {headers});
  }

  getMessageForUser() {
    const headers = this.getAuthorization();
    return this.http.get<Message[]>(this.formatURL('getMessagesForUser'), {headers});
  }

  createMessage(message: Message) {
    const headers = this.getAuthorization();
    return this.http.post(this.formatURL('createMessage'), message, {headers});
  }

  sendMessageToUser(message_id, user_id) {
    const headers = this.getAuthorization();
    return this.http.post(this.formatURL('sendMessageToUser'), {message_id: message_id, user_id: user_id}, {headers});
  }

  private formatURL(call): string {
    return environment.protocol + environment.host + ':' + environment.port + '/message/' + call;
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
