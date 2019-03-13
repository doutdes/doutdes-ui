import {Injectable} from '@angular/core';
import {IntervalDate} from '../../features/dashboard/redux-filter/filter.model';
import {subDays} from 'date-fns';
import {D_TYPE} from '../_models/Dashboard';
import {GA_CHART} from '../_models/GoogleData';
import {parseDate} from 'ngx-bootstrap';

@Injectable()
export class AggregatedDataService {

  constructor() {
  }

   getAggregatedData(data, chart_id, dateInterval : IntervalDate) {

    /** TODO LIST
     ** 1. dichiarare variabile coi dati filtrati in base al dateInterval (da cui calcolre max/min)
     *  2. calcolare intervallo precedente
     *  3. calcolare confronto tra dati filtrati e dati del precedente intervallo
     *
     *  ALTRO TODO
     *  1. modificare switch con ID seri di GA_TYPE
      *  */

    let resultData;

    let type;
    let sum = 0.;
    let highest = 0.;
    let lowest = 100.;

    let filteredData = data.filter(el => parseDate(el[0]) >= dateInterval.first && parseDate(el[0]) <= dateInterval.last);

     // chart.chartData = chart.type === D_TYPE.GA || chart.type === D_TYPE.YT
     //   ? chart.chartData.filter(el => parseDate(el[0]) >= filterInterval.first && parseDate(el[0]) <= filterInterval.last)
     //   : chart.chartData.filter(el => (new Date(el.end_time)) >= filterInterval.first && (new Date(el.end_time)) <= filterInterval.last);

    console.warn("AGGR DATA SERVICE filteredData ",filteredData);

    switch (chart_id) {

      case GA_CHART.IMPRESSIONS_DAY: //GA impressions
        type = 'ga_impressions';
        for (let i = 0; i < filteredData.length; i++) {
          const value = parseInt(filteredData[i][1]);
          sum += value;
          highest = value > highest ? value : highest;
          lowest = value < lowest ? value : lowest;
        }
        resultData = {average: sum / (filteredData.length - 1), highest: highest, lowest: lowest, type: type, interval: dateInterval, previousInterval: this.getPrevious(dateInterval)};
        break;
      case GA_CHART.SESSION_DAY:// GA Sessions by day
        type = 'ga_sessions';
        for (let i = 0; i < filteredData.length; i++) {
          const value = parseInt(filteredData[i][1]);
          sum += value;
          highest = value > highest ? value : highest;
          lowest = value < lowest ? value : lowest;
        }
        resultData = {average: sum / (filteredData.length - 1), highest: highest, lowest: lowest, type: type, interval: dateInterval, previousInterval: this.getPrevious(dateInterval)};
        break;
      case GA_CHART.BOUNCE_RATE: // GA bounce rate
        type = 'ga_bounce';
        // Calculates aggregated extra data
        for (let i = 0; i < filteredData.length; i++) {

          const value = parseFloat(filteredData[i][1]);
          sum += value;
          highest = value > highest ? value : highest;
          lowest = value < lowest ? value : lowest;
        }
        resultData = {average: sum / filteredData.length, highest: highest, lowest: lowest, type: type, interval: dateInterval, previousInterval: this.getPrevious(dateInterval)};
        break;
      case GA_CHART.AVG_SESS_DURATION: // GA Avg Session duration
        type = 'ga_avgsessionduration';
        // Calculates aggregated extra data
        for (let i = 0; i < filteredData.length; i++) {

          const value = parseFloat(filteredData[i][1]);
          sum += value;
          highest = value > highest ? value : highest;
          lowest = value < lowest ? value : lowest;
        }
        resultData = {average: sum / filteredData.length, highest: highest, lowest: lowest, type: type, interval: dateInterval, previousInterval: this.getPrevious(dateInterval)};
        break;

      case 23: // GA bounce rate
        type = 'IG_impr';
        // Calculates aggregated extra data
        for (let i = 1; i < data['dataTable'].length; i++) {

          const value = parseInt(data['dataTable'][i][1], 10);
          sum += value;
          highest = value > highest ? value : highest;
          lowest = value < lowest ? value : lowest;
        }

        //resultData = {average: sum / data['dataTable'].length, highest: highest, lowest: lowest, type: type, interval: dateInterval, previousInterval: this.getPrevious(dateInterval)};
        break;

    }

    return resultData;
  }

  // Returns the corresponding previous interval (eg: for 30 days, returns the previous 30 days)
  getPrevious(dateInterval : IntervalDate) : IntervalDate {

    let diff = Math.abs(dateInterval.first.getTime() - dateInterval.last.getTime());
    let diffDays = Math.ceil(diff / (1000 * 3600 * 24));

    let newPreviousInterval = {
      first: subDays(dateInterval.first, diffDays + 1), // TODO fix this, handling the case when the start date falls before the first valid date
      last: subDays(dateInterval.first, 1)
    }

    return newPreviousInterval;
  }

  updateAggregatedIntervals(newInterval : IntervalDate, aggregatedData) {

    aggregatedData.interval = newInterval;
    aggregatedData.previousInterval = this.getPrevious(newInterval);
  }
}
