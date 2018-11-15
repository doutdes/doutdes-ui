import {FILTER_INITIAL_STATE, FilterState, IntervalDate} from './filter.model';
import {FILTER_INIT, FILTER_BY_DATA, FILTER_RESET, FILTER_CLEAR, FILTER_UPDATE} from './filter.actions';

export function FilterReducer(state: FilterState = FILTER_INITIAL_STATE, action): FilterState {
  switch (action.type) {
    case FILTER_INIT:
      return Object.assign({}, state, // TODO Per la GeoMap basta inizializzare l'indice 0 come filtered e tutta la lista come original
        {
          originalData: action.originalData,
          originalInterval: action.originalInterval,
          dataFiltered: action.dataFiltered,
          filterInterval: action.originalInterval
          // dataFiltered: Object.create(action.originalData),
          // filterInterval: Object.create(action.originalInterval)
        });

    case FILTER_UPDATE:
      return Object.assign({}, state,
        {
          originalData: action.originalData,
          originalInterval: state.originalInterval,
          dataFiltered: action.dataFiltered,
          filterInterval: state.filterInterval
        });

    case FILTER_BY_DATA:
      return Object.assign({}, state,
        {
          originalData: state.originalData,
          originalInterval: state.originalInterval,
          dataFiltered: action.dataFiltered,
          filterInterval: action.filterInterval
        });

    case FILTER_CLEAR:
      return Object.assign({}, state, {
        originalData: null,
        originalInterval: null,
        dataFiltered: null,
        filterInterval: null
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
