import {LocalStorage} from '@ngx-pwa/local-storage';
import {Injectable} from '@angular/core';

@Injectable()
export class StoreService {

  constructor(protected localStorage: LocalStorage) {}

  setToken(token: string) {
    this.localStorage.setItem('jwt', token).subscribe(() => {});
  }

  removeToken() {
    this.localStorage.removeItem('jwt').subscribe(() => {}, () => {});
  }

  setUsername(username: string) {
    this.localStorage.setItem('username', username).subscribe(() => {});
  }

  removeUsername() {
    this.localStorage.removeItem('username').subscribe(() => {}, () => {});
  }

  clear() {
    this.localStorage.clear().subscribe(() => {}, () => {});
  }
}
