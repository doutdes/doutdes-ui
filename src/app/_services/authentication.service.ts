import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { hashSync } from '@types/bcrypt-nodejs';
import { map } from 'rxjs/internal/operators';

@Injectable()
export class AuthenticationService {
  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    const psw = hashSync(password);

    return this.http.post<any>('localhost:3000/login', {username: username, password: psw} )
      .pipe(map(response => {
        if (response.user && response.token) {
          localStorage.setItem('currentUser', response.token);
        }

        return response.token;
      }));
  }

  logout() {
    localStorage.removeItem('currentUser');
  }
}
