/** Login Actions **/

import {Injectable} from '@angular/core';
import {IAppState} from '../../../shared/store/model';
import {NgRedux} from '@angular-redux/store';
import {Credentials} from './login.model';

export const LOGIN_USER          = 'LOGIN_USER';
export const LOGIN_USER_SUCCESS  = 'LOGIN_USER_SUCCESS';
export const LOGIN_USER_ERROR    = 'LOGIN_USER_ERROR';
export const LOGOUT_USER         = 'LOGOUT_USER';

@Injectable()
export class LoginActions {
  constructor(private ngRedux: NgRedux<IAppState>) {}

  logoutUser() {
    this.ngRedux.dispatch({ type: LOGOUT_USER });
  }
}
