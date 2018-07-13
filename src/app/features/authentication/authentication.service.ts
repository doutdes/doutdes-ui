import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Credentials, LoginState} from './login/login.model';
import {NgRedux, select} from '@angular-redux/store';
import {IAppState} from '../../shared/store/model';
import {LOGIN_USER_ERROR, LOGIN_USER_SUCCESS, LoginActions} from './login/login.actions';
import {Router} from '@angular/router';
import {map} from 'rxjs/internal/operators';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {StoreService} from '../../shared/_services/store.service';

@Injectable()
export class AuthenticationService {

  constructor(
    private http: HttpClient,
    private ngRedux: NgRedux<IAppState>,
    private loginActions: LoginActions
  ) {
  }

  login(credentials: Credentials) {

    let headers = new HttpHeaders();
    headers = headers.set('Authorization', 'Basic ' + btoa(credentials.username + ':' + credentials.password));

    const httpOptions = {
      headers: headers
    };

    return this.http.post<any>('http://localhost:3000/login', {}, httpOptions)
      .pipe(map(response => {

        if (response['user'] && response['token']) {

          this.loginActions.loginUserSuccess(response['user'], response['token']);

          return response;
        } else {
          this.loginActions.loginUserError();
        }
      }));
  }

  logout() {
  }


}


