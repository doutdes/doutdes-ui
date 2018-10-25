import {FILTER_INITIAL_STATE, FilterState} from './filter.model';
import {FILTER_INIT, FILTER_BY_DATA, FILTER_RESET} from './filter.actions';

export function FilterReducer(state: FilterState = FILTER_INITIAL_STATE, action): FilterState {
  switch (action.type) {
    case FILTER_INIT:
      return Object.assign({}, state,
        {
          originalData: action.originalData,
          originalInterval: action.originalInterval,
          dataFiltered: action.originalInterval,
          filterInterval: action.originalInterval
        });

    case FILTER_BY_DATA:
      return Object.assign({}, state,
        {
          filterFiltered: action.filterInterval,
        });

    case FILTER_RESET:
      return Object.assign({}, state,
        {
          dataFiltered: state.originalData,
          filterInterval: state.originalInterval
        });

    default:
      return state;
  }
}
