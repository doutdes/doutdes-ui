import {BREADCRUMB_UPDATE, BREADCRUMB_DELETE} from './breadcrumb.actions';
import {BreadcrumbState, BREADCRUMB_INITIAL_STATE} from './breadcrumb.model';

export function BreadcrumbReducer(state: BreadcrumbState = BREADCRUMB_INITIAL_STATE, action): BreadcrumbState {
  switch (action.type) {
    case BREADCRUMB_UPDATE:
      return Object.assign({}, state,
        {
          list: action.list,
        });

    case BREADCRUMB_DELETE:
      return Object.assign({}, state,
        {
          list: [],
        });
    default:
      return state;
  }
}
