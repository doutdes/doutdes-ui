import {Breadcrumb} from './Breadcrumb';

export interface BreadcrumbState {
  list: Breadcrumb[];
}

export const BREADCRUMB_INITIAL_STATE: BreadcrumbState = {
  list: []
};
