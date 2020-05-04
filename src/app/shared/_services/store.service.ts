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

  setType(type) {
    localStorage.setItem('type', type);
  }

  getType() {
    return localStorage.getItem('type');
  }

  removeType() {
    localStorage.removeItem('type');
  }

  setUserNames(name: string) {
    localStorage.setItem('usernames', name);
  }

  getUserNames() {
    return localStorage.getItem('usernames');
  }

  getLang () {
    return localStorage.getItem('lang');
  }

  removeUserNames() {
    localStorage.removeItem('usernames');
  }

  clear() {
    localStorage.clear();
  }
}
