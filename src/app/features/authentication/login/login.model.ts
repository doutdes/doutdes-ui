import {User} from '../../../shared/_models/User';

export interface Credentials {
  username?: string;
  password?: string;
}

export interface LoginState {
  token: string;
  user: User;
  hasError: boolean;
  isLoading: boolean;
}

export const LOGIN_INITIAL_STATE: LoginState = {
  token: null,
  user: null,
  hasError: false,
  isLoading: false,
};
