import {DashboardData, FILTER_INITIAL_STATE, FilterState, IntervalDate} from './filter.model';
import {FILTER_INIT, FILTER_BY_DATA, FILTER_RESET, FILTER_CLEAR, FILTER_UPDATE, FILTER_REMOVE_CURRENT} from './filter.actions';

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
        storedDashboards: null
      });

    case FILTER_REMOVE_CURRENT:
      return Object.assign({}, state, {
        currentDashboard: null,
        filteredDashboard: null
      });

    case FILTER_RESET:
      return Object.assign({}, state, {
        currentDashboard: null,
        filteredDashboard: null,
        storedDashboards: null
      });

    default:
      return state;
  }
}

