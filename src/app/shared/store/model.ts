import {LoginState} from '../../features/authentication/login/login.model';
import {LOGIN_INITIAL_STATE} from '../../features/authentication/login/login.model';
import {BREADCRUMB_INITIAL_STATE, BreadcrumbState} from '../../core/breadcrumb/breadcrumb.model';
import {FILTER_INITIAL_STATE, FilterState} from '../../features/dashboard/redux-filter/filter.model';

export interface IAppState {
  login: LoginState;
  breadcrumb: BreadcrumbState;
  filter: FilterState;
}

export const FIRST_STATE: IAppState = {
  login: LOGIN_INITIAL_STATE,
  breadcrumb: BREADCRUMB_INITIAL_STATE,
  filter: FILTER_INITIAL_STATE
};
