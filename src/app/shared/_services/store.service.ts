import {Injectable} from '@angular/core';

// TODO eliminate this monster

@Injectable()
export class StoreService {

  constructor() {}

  setToken(token: string) {
    localStorage.setItem('jwt', token);
  }

  getToken() {
    return localStorage.getItem('jwt');
  }

  removeToken() {
    localStorage.removeItem('jwt');
  }

  setId(id) {
    localStorage.setItem('id', id);
  }

  getId() {
    return localStorage.getItem('id');
  }

  removeId() {
    localStorage.removeItem('id');
  }

  clear() {
    localStorage.clear();
  }
}
