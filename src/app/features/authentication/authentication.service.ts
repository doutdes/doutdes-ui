import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Credentials, LoginState} from './login/login.model';
import {NgRedux, select} from '@angular-redux/store';
import {IAppState} from '../../shared/store/model';
import {LOGIN_USER_ERROR, LOGIN_USER_SUCCESS} from './login/login.actions';
import {Router} from '@angular/router';
import {map} from 'rxjs/internal/operators';
import {Observable, of} from 'rxjs';

@Injectable()
export class AuthenticationService {

  @select('login') loginState;

  constructor(
    private http: HttpClient,
    private ngRedux: NgRedux<IAppState>,
    // private router: Router
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
          console.log('Setto');
          this.ngRedux.dispatch({type: LOGIN_USER_SUCCESS, user: response['user'], token: response['token']});

          return response;
        } else {
          this.ngRedux.dispatch({type: LOGIN_USER_ERROR});
        }
      }));
  }

  isLogged(): Observable<boolean> {
    this.loginState.subscribe(state => {
      console.log(state['token']);
      return of(state['token'] != null);
    });

    return of(false);
  }
}


