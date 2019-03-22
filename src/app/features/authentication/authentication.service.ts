import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Credentials} from './login/login.model';
import {NgRedux} from '@angular-redux/store';
import {IAppState} from '../../shared/store/model';
import {LoginActions} from './login/login.actions';
import {map} from 'rxjs/internal/operators';
import {environment} from '../../../environments/environment';

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

    console.warn(environment.protocol + environment.host + ':' + environment.port + '/login');

    return this.http.post<any>(environment.protocol + environment.host + ':' + environment.port + '/login', {}, httpOptions)
      .pipe(map(response => {

        if (response['User'] && response['token']) {

          this.loginActions.loginUserSuccess(response['User'], response['token']);

          return response;
        } else {
          this.loginActions.loginUserError();
        }
      }));
  }

  logout() {
  }


}


