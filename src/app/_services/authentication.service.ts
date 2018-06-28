import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map, repeatWhen} from 'rxjs/internal/operators';
import {NgRedux} from '@angular-redux/store';
import {IAppState} from '../store/model';
import {LOGGED, SLOGGED} from '../store/actions';


@Injectable()
export class AuthenticationService {
  constructor(
    private http: HttpClient,
    private ngRedux: NgRedux<IAppState>
  ) {
  }

  login(username: string, password: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', 'Basic ' + btoa(username + ':' + password));

    const httpOptions = {
      headers: headers
    };

    return this.http.post<any>('http://localhost:3000/login', {}, httpOptions).pipe(map(response => {
      this.onLogin(username, response['token']);
      return true;
    }));
  }

  logout() {
    this.ngRedux.dispatch({type: SLOGGED});
  }

  onLogin(username: string, token: string){
    this.ngRedux.dispatch({type: LOGGED, username: username, jwt: token});
  }
}
