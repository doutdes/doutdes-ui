/** 3rd part **/
import {Action} from '@ngrx/store';

/** App Models **/
import {Login} from './login.model';

export const LOGIN          = '[Login] Login';
export const LOGIN_SUCCESS  = '[Login] Login Success';
export const LOGIN_ERROR    = '[Login] Login Error';

export class LoginAction implements Action {
  readonly type = LOGIN;
  constructor (public payload: Login) {}
}

export class LoginSuccessAction implements Action {
  readonly type = LOGIN_SUCCESS;
  constructor (public payload: boolean) {}
}

export class LoginErrorAction implements Action {
  readonly type = LOGIN_ERROR;
  constructor (public payload: any) {}
}

// Export
export type All
  = LoginAction
  | LoginSuccessAction
  | LoginErrorAction;
