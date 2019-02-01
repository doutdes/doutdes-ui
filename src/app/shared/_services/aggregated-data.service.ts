import {Injectable} from '@angular/core';
import {IntervalDate} from '../../features/dashboard/redux-filter/filter.model';
import {subDays} from 'date-fns';

@Injectable()
export class AggregatedDataService {

  constructor() {
  }

  getAggregatedData(data, chart_id, dateInterval : IntervalDate) {

    let resultData;

    let type;
    let sum = 0.;
    let highest = 0.;
    let lowest = 100.;

    switch (chart_id) {

      case 4: //GA impressions
        type = 'ga_impressions';
        for (let i = 0; i < data.length; i++) {
          const value = parseInt(data[i][1]);
          sum += value;
          highest = value > highest ? value : highest;
          lowest = value < lowest ? value : lowest;
        }
        resultData = {average: sum / data.length, highest: highest, lowest: lowest, type: type, interval: dateInterval, previousInterval: this.getPrevious(dateInterval)};
        break;
      case 10: // GA bounce rate
        type = 'ga_bounce';
        // Calculates aggregated extra data
        for (let i = 0; i < data.length; i++) {

          const value = parseFloat(data[i][1]);
          sum += value;
          highest = value > highest ? value : highest;
          lowest = value < lowest ? value : lowest;
        }
        resultData = {average: sum / data.length, highest: highest, lowest: lowest, type: type, interval: dateInterval, previousInterval: this.getPrevious(dateInterval)};
        break;
      case 11: // GA Avg Session duration
        type = 'ga_avgsessionduration';
        // Calculates aggregated extra data
        for (let i = 0; i < data.length; i++) {

          const value = parseFloat(data[i][1]);
          sum += value;
          highest = value > highest ? value : highest;
          lowest = value < lowest ? value : lowest;
        }
        resultData = {average: sum / data.length, highest: highest, lowest: lowest, type: type, interval: dateInterval, previousInterval: this.getPrevious(dateInterval)};
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
