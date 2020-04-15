import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {User, VerifyResponse} from '../_models/User';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';

@Injectable()
export class UserService {
  constructor(private http: HttpClient, private storeService: StoreService) { }

  register(user: User) {
    return this.http.post(this.formatUrl('create'), user);
  }

  get() {
    const headers = this.getAuthorization();
    // return this.http.get<User>(environment.protocol + environment.host + ':' + environment.port + '/users/getFromId', {headers});
    return this.http.get<User>(this.formatUrl('getFromId'), {headers});
  }

  update(user: User) {
    const headers = this.getAuthorization();
    return this.http.put(this.formatUrl('update'), user, {headers});
  }

  private formatUrl(methodName) {
    return environment.protocol + environment.host + ':' + environment.port + '/users/' + methodName;
  }

  verifyEmail(token, email) {
    return this.http.get<VerifyResponse>(this.formatUrl('verifyEmail') + '?email=' + email + '&token=' + token);
  }


  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }

  // function to signal, in mongodb,the last access of a user on a dashboard
  logger(type, user) {
    const headers = this.getAuthorization();

    return this.http.post(environment.protocol + environment.host + ':' + environment.port + '/mongo/',
      {user: user.id, username: user.username, type: type}, {headers});
  }
}
