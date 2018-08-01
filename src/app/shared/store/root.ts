import {combineReducers} from 'redux';
import {LoginReducer} from '../../features/authentication/login/login.reducer';
import {BreadcrumbReducer} from '../../core/breadcrumb/breadcrumb.reducer';

export const rootReducer = combineReducers({
    login: LoginReducer,
    breadcrumb: BreadcrumbReducer
  }
);
