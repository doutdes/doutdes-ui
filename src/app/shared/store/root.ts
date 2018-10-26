import {combineReducers} from 'redux';
import {LoginReducer} from '../../features/authentication/login/login.reducer';
import {BreadcrumbReducer} from '../../core/breadcrumb/breadcrumb.reducer';
import {FilterReducer} from '../../features/dashboard/redux-filter/filter.reducer';

export const rootReducer = combineReducers({
    login: LoginReducer,
    breadcrumb: BreadcrumbReducer,
    filter: FilterReducer
  }
);
