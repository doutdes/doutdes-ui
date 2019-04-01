import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import { User } from '../_models/User';
import {environment} from '../../../environments/environment';
import {StoreService} from './store.service';

@Injectable()
export class UserService {
  constructor(private http: HttpClient, private storeService: StoreService) { }

  register(user: User) {
    return this.http.post(environment.protocol + environment.host + ':' + environment.port + '/users/create', user);
  }

  get() {
    const headers = this.getAuthorization();
    return this.http.get<User>(environment.protocol + environment.host + ':' + environment.port + '/users/getFromId', {headers});
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
