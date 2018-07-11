import {LOGIN_USER, LOGIN_USER_SUCCESS, LOGIN_USER_ERROR} from './login.actions';
import {INITIAL_STATE, LoginState} from './login.model';

export function LoginReducer(state: LoginState = INITIAL_STATE , action): LoginState {

  switch (action.type) {
    case LOGIN_USER:
      return Object.assign({}, state,
        {
          token: null,
          user: {},
          hasError: false,
          isLoading: true
        });

    case LOGIN_USER_SUCCESS:
      console.log('LOGIN_USER_SUCCESS');
      console.log(action.token);
      return Object.assign({}, state,
        {
          token: action.token,
          user: action.user,
          hasError: false,
          isLoading: false
        });

    case LOGIN_USER_ERROR:
      return Object.assign({}, state,
        {
          token: null,
          user: {},
          hasError: true,
          isLoading: false
        });

    default:
      return state;
    }
}
