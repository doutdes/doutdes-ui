import {combineReducers} from 'redux';
import {LoginReducer} from '../../features/authentication/login/login.reducer';

export const rootReducer = combineReducers({
    login: LoginReducer
  }
);
