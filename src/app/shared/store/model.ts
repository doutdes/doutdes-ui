import {LoginState} from '../../features/authentication/login/login.model';
import {INITIAL_STATE} from '../../features/authentication/login/login.model';

export interface IAppState {
  login: LoginState;
}

export const FIRST_STATE: IAppState = {
  login: INITIAL_STATE
}
