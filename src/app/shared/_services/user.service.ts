import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../_models/User';

@Injectable()
export class UserService {
  constructor(private http: HttpClient) { }

  register(user: User) {
    return this.http.post('http://www.doutdes-cluster.it:3000/users/create', user);
  }
}
