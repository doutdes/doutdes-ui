import {LOGIN_USER, LOGIN_USER_SUCCESS, LOGIN_USER_ERROR, LOGOUT_USER} from './login.actions';
import {LOGIN_INITIAL_STATE, LoginState} from './login.model';


export function LoginReducer(state: LoginState = LOGIN_INITIAL_STATE , action): LoginState {

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

    case LOGOUT_USER:
      return Object.assign({}, state,
        {
          token: null,
          user: {},
          hasError: false,
          isLoading: false
        });

    default:
      return state;
    }
}
