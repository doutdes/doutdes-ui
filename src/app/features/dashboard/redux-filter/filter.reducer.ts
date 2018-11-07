import {FILTER_INITIAL_STATE, FilterState, IntervalDate} from './filter.model';
import {FILTER_INIT, FILTER_BY_DATA, FILTER_RESET, FILTER_CLEAR} from './filter.actions';

export function FilterReducer(state: FilterState = FILTER_INITIAL_STATE, action): FilterState {
  switch (action.type) {
    case FILTER_INIT:
      return Object.assign({}, state,
        {
          originalData: action.originalData,
          originalInterval: action.originalInterval,
          dataFiltered: action.originalData,
          filterInterval: action.originalInterval
        });

    case FILTER_BY_DATA:
      return Object.assign({}, state,
        {
          originalData: state.originalData,
          originalInterval: state.originalInterval,
          dataFiltered: filterByDate(JSON.stringify(state.originalData), action.filterInterval),
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

function filterByDate (originalData, filterInterval: IntervalDate) : any {

  let originalReceived = JSON.parse(originalData);
  let filtered = [];

  if(originalReceived) {

    originalReceived.forEach(chart => {

      // console.log(chart['chartData']);

      if (chart['title'] !== 'Geomap') {

        if(chart['chartData']['chartType'] == 'PieChart' || chart['chartData']['chartType'] == 'Table' || chart['chartData']['chartType'] == 'ColumnChart') {
          console.log(chart['Chart']['title']);
          // return originalReceived;
        } else {

          let header = [chart['chartData']['dataTable'].shift()];
          let newArray = [];

          chart['chartData']['dataTable'].forEach(element => newArray.push([new Date(element[0]), element[1]]));
          newArray = newArray.filter(element => element[0] >= filterInterval.dataStart && element[0] <= filterInterval.dataEnd);

          chart['chartData']['dataTable'] = header.concat(newArray);
        }
      }

      filtered.push(chart);
    });
  }

  return filtered;
}

function getCallForDataFiltered(chartName: string, filterInterval: IntervalDate) {

  let filtered;

  switch (chartName) {
    case 'Geomap':
      break;
    case 'Sources Pie Chart':
      break;
    case 'Referral':
      break;
    case 'Fan By Country Pie Chart':
      break;
    case 'Sources Column Chart':
      break;
    default:
      filtered = null;
  }

  return filtered;
}
