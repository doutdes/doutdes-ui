import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {map, repeatWhen} from 'rxjs/internal/operators';

@Injectable()
export class AuthenticationService {
  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', 'Basic ' + btoa(username + ':' + password));

    const httpOptions = {
      headers: headers
    };

    return this.http.post<any>('http://localhost:3000/login', {}, httpOptions)
      .pipe(map(response => {

        if (response['user'] && response['token']) {
          localStorage.setItem('currentUser', response['token']);
          localStorage.setItem('username', response['user'].username);
        }

        return response['token'];
      }));
  }

  logout() {
    localStorage.clear();
  }
}
