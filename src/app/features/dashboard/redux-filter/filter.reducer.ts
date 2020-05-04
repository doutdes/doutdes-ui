import {FILTER_INITIAL_STATE, FilterState} from './filter.model';
import {FILTER_BY_DATA, FILTER_CLEAR, FILTER_INIT, FILTER_REMOVE_CURRENT, FILTER_RESET, FILTER_UPDATE} from './filter.actions';

export function FilterReducer(state: FilterState = FILTER_INITIAL_STATE, action): FilterState {
  switch (action.type) {
    case FILTER_INIT:
      return Object.assign({}, state,
        {
          currentDashboard: action.currentDashboard,
          filteredDashboard: action.filteredDashboard,
          storedDashboards: action.storedDashboards
        });

    case FILTER_UPDATE:
      return Object.assign({}, state,
        {
          currentDashboard: action.currentDashboard,
          filteredDashboard: action.filteredDashboard,
          storedDashboards: action.storedDashboards
        });

    case FILTER_BY_DATA:
      return Object.assign({}, state,
        {
          filteredDashboard: action.filteredDashboard,
        });

    case FILTER_CLEAR:
      return Object.assign({}, state, {
        currentDashboard: null,
        filteredDashboard: null,
        storedDashboards: []
      });

    case FILTER_REMOVE_CURRENT:
      return Object.assign({}, state, {
        currentDashboard:  null,
        filteredDashboard:  null,
      });

    case FILTER_RESET:
      return Object.assign({}, state, {
        currentDashboard: null,
        filteredDashboard: null,
        storedDashboards: []
      });

    default:
      return state;
  }
}

