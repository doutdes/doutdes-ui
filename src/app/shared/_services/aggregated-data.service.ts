import {Injectable} from '@angular/core';
import {IntervalDate} from '../../features/dashboard/redux-filter/filter.model';
import {subDays} from 'date-fns';
import {D_TYPE} from '../_models/Dashboard';
import {GA_CHART} from '../_models/GoogleData';
import {parseDate} from 'ngx-bootstrap';
import {DashboardCharts} from '../_models/DashboardCharts';

@Injectable()
export class AggregatedDataService {

  constructor() {
  }

  getAggregatedData(chart: DashboardCharts, dateInterval: IntervalDate) {

    let sum = 0.;
    let highest = Number.MIN_SAFE_INTEGER;
    let lowest = Number.MAX_SAFE_INTEGER;

    let filteredData = chart.type === D_TYPE.GA || chart.type === D_TYPE.YT
      ? chart.chartData.filter(el => parseDate(el[0]) >= dateInterval.first && parseDate(el[0]) <= dateInterval.last)
      : chart.chartData.filter(el => (new Date(el.end_time)) >= dateInterval.first && (new Date(el.end_time)) <= dateInterval.last);


    switch (chart.type) {

      case D_TYPE.GA:
      case D_TYPE.YT:
        for (let i = 0; i < filteredData.length; i++) {
          const value = parseFloat(filteredData[i][filteredData[i].length - 1]);
          sum += value;
          highest = value > highest ? value : highest;
          lowest = value < lowest ? value : lowest;
        }
        break;
      case D_TYPE.FB:
      case D_TYPE.IG:
        for (let i = 0; i < filteredData.length; i++) {
          const value = parseFloat(filteredData[i]['value']);
          sum += value;
          highest = value > highest ? value : highest;
          lowest = value < lowest ? value : lowest;
        }
        break;
    }

    console.warn({
      average: sum / filteredData.length,
      highest: highest,
      lowest: lowest,
      interval: dateInterval,
      previousInterval: this.getPrevious(dateInterval)
    });

    return {
      average: sum / filteredData.length,
      highest: highest,
      lowest: lowest,
      interval: dateInterval,
      previousInterval: this.getPrevious(dateInterval)
    };
  }

  // Returns the corresponding previous interval (eg: for 30 days, returns the previous 30 days)
  getPrevious(dateInterval: IntervalDate): IntervalDate {

    let diff = Math.abs(dateInterval.first.getTime() - dateInterval.last.getTime());
    let diffDays = Math.ceil(diff / (1000 * 3600 * 24));

    let newPreviousInterval = {
      first: subDays(dateInterval.first, diffDays + 1), // TODO fix this, handling the case when the start date falls before the first valid date
      last: subDays(dateInterval.first, 1)
    };

    return newPreviousInterval;
  }

  updateAggregatedIntervals(newInterval: IntervalDate, aggregatedData) {

    aggregatedData.interval = newInterval;
    aggregatedData.previousInterval = this.getPrevious(newInterval);
  }
}
