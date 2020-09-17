import {Injectable} from '@angular/core';
import {IntervalDate} from '../../features/dashboard/redux-filter/filter.model';
import {subDays} from 'date-fns';
import {D_TYPE} from '../_models/Dashboard';
import {parseDate} from 'ngx-bootstrap';
import {DashboardCharts} from '../_models/DashboardCharts';
import {calculateBytes} from '@angular/cli/utilities/bundle-calculator';
import {FB_CHART} from '../_models/FacebookData';
import get = Reflect.get;
import {getValueFromObject} from 'ngx-bootstrap/typeahead';
import {count} from 'rxjs/operators';
import * as moment from 'moment';

@Injectable()
export class AggregatedDataService {

  constructor() {

  }


  getAggregatedData(chart: DashboardCharts, dateInterval: IntervalDate) {

    ///TODO really ugly handling of filtered data: basically a copy-paste  of filter.actions -> better call the method
    let sum = 0;
    let highest = Number.MIN_SAFE_INTEGER;
    let lowest = Number.MAX_SAFE_INTEGER;

    let prevSum = 0;
    let prevHighest = Number.MIN_SAFE_INTEGER;
    let prevLowest = Number.MAX_SAFE_INTEGER;

    let nValues = 0;
    let prevNValues = 0;
    let filteredData;
    switch (chart.type) {
      case D_TYPE.GA:
        filteredData = chart.chartData.filter(el => parseDate(el[0]).getTime() >= dateInterval.first.getTime() && parseDate(el[0]).getTime() <= dateInterval.last.getTime());
        break;
      case D_TYPE.YT:
        filteredData = chart.chartData.filter(el => parseDate(el.date).getTime() >= dateInterval.first.getTime() && parseDate(el.date).getTime() <= dateInterval.last.getTime());
        break;
      case D_TYPE.FBM:
        filteredData = chart.chartData.filter(el => (new Date(el.date_stop)) >=  dateInterval.first && (moment(el.date_stop).toDate()) <= dateInterval.last);
        break;
      default:
        filteredData = chart.chartData.filter(el => (moment(el.end_time).toDate()) >= dateInterval.first && (moment(el.end_time).toDate()) <= dateInterval.last);
        break;
    }
    let prevFilteredData;
    let myMap;
    let keys = [];
    let tmp = [];

    if ((chart.type === D_TYPE.FB) &&
      ((chart.chart_id === FB_CHART.REACTIONS_LINEA) ||
        (chart.chart_id === FB_CHART.PAGE_VIEW_EXTERNALS_LINEA))) {

      myMap = new Map();

      for (let el of chart.chartData) {
        let n = el['value'];
        for (let key in n) {
          if (myMap.has(key)) {
            myMap.set(key, 0);
          } else {
            myMap.set(key, 0);
          }
        }
      }

      var key = myMap.keys();

      for (let i = 0; i < myMap.size; i++) {
        keys.push([key.next().value]);
      }

      if (keys.length != 0) {

        for (let i = 0; i < chart.chartData.length; i++) {
          if (!chart.chartData[i].value) {
            tmp.push({'end_time': chart.chartData[i].end_time, 'value': 0});
          } else {
            let count = 0;
            for (let web of keys) {
              if (chart.chartData[i].value[web]) {
                count += chart.chartData[i].value[web];
              }
            }
            tmp.push({'end_time': chart.chartData[i].end_time, 'value': count});
          }
        }

        chart.chartData = tmp;
      }

      filteredData = chart.chartData.filter(el => (new Date(el.end_time)) >= dateInterval.first && (new Date(el.end_time)) <= dateInterval.last);

      let prevDate = this.getPrevious(dateInterval);
      prevFilteredData = chart.chartData.filter(el => (new Date(el.end_time)) >= prevDate.first && (new Date(el.end_time)) <= prevDate.last);

    } else {


      switch (chart.type) {
        case D_TYPE.GA :
          filteredData = chart.chartData.filter(el => parseDate(el[0]) >= dateInterval.first && parseDate(el[0]) <= dateInterval.last);
          break;
        case D_TYPE.YT :
          filteredData = chart.chartData.filter(el => parseDate(el.date) >= dateInterval.first && parseDate(el.date) <= dateInterval.last);
          break;
        case D_TYPE.FBM:
          filteredData = chart.chartData.filter(el => (new Date(el.date_stop)) >=  dateInterval.first && (moment(el.date_stop).toDate()) <= dateInterval.last);
          break;
        default:
          filteredData = chart.chartData.filter(el => (moment(el.end_time).toDate()) >= dateInterval.first && (moment(el.end_time).toDate()) <= dateInterval.last);
          break;
      }
      /* filteredData = chart.type === D_TYPE.GA || chart.type === D_TYPE.YT
         ? chart.chartData.filter(el => parseDate(el[0]) >= dateInterval.first && parseDate(el[0]) <= dateInterval.last)
         : chart.chartData.filter(el => (new Date(el.end_time)) >= dateInterval.first && (new Date(el.end_time)) <= dateInterval.last);
 */
      let prevDate = this.getPrevious(dateInterval);
      if (chart.type === D_TYPE.FBM) {
        prevFilteredData = chart.chartData.filter(el => (new Date(el.date_stop)) >=  prevDate.first && (moment(el.date_stop).toDate()) <= prevDate.last);
      }
      else {
        prevFilteredData = chart.type === D_TYPE.GA || chart.type === D_TYPE.YT
          ? chart.chartData.filter(el => parseDate(el[0]) >= prevDate.first && parseDate(el[0]) <= prevDate.last)
          : chart.chartData.filter(el => (moment(el.end_time).toDate()) >= prevDate.first && (moment(el.end_time).toDate()) <= prevDate.last);
      }
    }

    /*
    let filteredData = chart.type === D_TYPE.GA || chart.type === D_TYPE.YT
      ? chart.chartData.filter(el => parseDate(el[0]) >= dateInterval.first && parseDate(el[0]) <= dateInterval.last)
      : chart.chartData.filter(el => (new Date(el.end_time)) >= dateInterval.first && (new Date(el.end_time)) <= dateInterval.last);
*/
    /*
        /*
        let prevFilteredData = chart.type === D_TYPE.GA || chart.type === D_TYPE.YT
          ? chart.chartData.filter(el => parseDate(el[0]) >= prevDate.first && parseDate(el[0]) <= prevDate.last)
          : chart.chartData.filter(el => (new Date(el.end_time)) >= prevDate.first && (new Date(el.end_time)) <= prevDate.last);
    */
    let prevDate = this.getPrevious(dateInterval);

    switch (chart.type) {
      case D_TYPE.GA:
        prevFilteredData = chart.chartData.filter(el => parseDate(el[0]).getTime() >= prevDate.first.getTime() && parseDate(el[0]).getTime() <= prevDate.last.getTime());
        break;
      case D_TYPE.YT:
        prevFilteredData = chart.chartData.filter(el => parseDate(el.date).getTime() >= prevDate.first.getTime() && parseDate(el.date).getTime() <= prevDate.last.getTime());
        break;
      case D_TYPE.FBM:
        prevFilteredData = chart.chartData.filter(el => (moment(el.date_stop).toDate()) >= dateInterval.first && (moment(el.date_stop).toDate()) <= dateInterval.last);
        break;
      default:
        prevFilteredData = chart.chartData.filter(el => (moment(el.end_time).toDate()) >= prevDate.first && (moment(el.end_time).toDate()) <= prevDate.last);
        break;
    }


    switch (chart.type) {

      case D_TYPE.GA:
        for (let i = 0; i < filteredData.length; i++) {
          const value = parseFloat(filteredData[i][filteredData[i].length - 1]);
          if (value) {
            sum += value;
            nValues++;
          }
          highest = value > highest ? value : highest;
          lowest = value < lowest ? value : lowest;
        }

        ///WORKING ON GETTING JSON FOR PREVIOUS PERIOD
        for (let i = 0; i < prevFilteredData.length; i++) {
          const value = parseFloat(prevFilteredData[i][prevFilteredData[i].length - 1]);
          if (value) {
            prevSum += value;
            prevNValues++;
          }
          prevHighest = value > prevHighest ? value : prevHighest;
          prevLowest = value < prevLowest ? value : prevLowest;
        }
        break;
      case D_TYPE.FBM:
        const type_value = chart.title.substring(chart.title.indexOf('_')+1);

        for (let i = 0; i < filteredData.length; i++) {
          const value = parseFloat(filteredData[i][type_value.toLowerCase()]);

          if (value) {
            sum += value;
            nValues++;
          }
          highest = value > highest ? value : highest;
          lowest = value < lowest ? value : lowest;
        }

        // WORKING ON GETTING JSON FOR PREVIOUS PERIOD
        for (let i = 0; i < prevFilteredData.length; i++) {
          const value = parseFloat(prevFilteredData[i]['value']);
          if (value) {
            prevSum += value;
            prevNValues++;
          }
          prevHighest = value > prevHighest ? value : prevHighest;
          prevLowest = value < prevLowest ? value : prevLowest;
        }
        break;

      case D_TYPE.FB:
      case D_TYPE.IG:
      case D_TYPE.YT:
        for (let i = 0; i < filteredData.length; i++) {
          const value = parseFloat(filteredData[i]['value']);
          if (value) {
            sum += value;
            nValues++;
          }
          highest = value > highest ? value : highest;
          lowest = value < lowest ? value : lowest;
        }

        // WORKING ON GETTING JSON FOR PREVIOUS PERIOD
        for (let i = 0; i < prevFilteredData.length; i++) {
          const value = parseFloat(prevFilteredData[i]['value']);
          if (value) {
            prevSum += value;
            prevNValues++;
          }
          prevHighest = value > prevHighest ? value : prevHighest;
          prevLowest = value < prevLowest ? value : prevLowest;
        }
        break;
    }

    if (highest === Number.MIN_SAFE_INTEGER)
      highest = 0;
    if (lowest === Number.MAX_SAFE_INTEGER)
      lowest = 0;
    if (prevHighest === Number.MIN_SAFE_INTEGER)
      prevHighest = 0;
    if (prevLowest === Number.MAX_SAFE_INTEGER)
      prevLowest = 0;


    let prevAverage = (prevNValues === 0) ? 0 : (prevSum / prevNValues);
    let average = (nValues === 0) ? 0 : (sum / nValues);

    let result = {
      tot: sum,
      average: average,
      prevAverage: prevAverage,
      highest: highest,
      prevHighest: prevHighest,
      lowest: lowest,
      prevLowest: prevLowest,
      interval: dateInterval,
      prevInterval: this.getPrevious(dateInterval),
    };

    /* console.log('----------');
     console.log('CURRENT : ');
     console.log('FROM: '+result.interval.first);
     console.log('TO: '+result.interval.last);
     console.log('PREVIOUS :');
     console.log('FROM: '+result.prevInterval.first);
     console.log('TO: '+result.prevInterval.last);
     console.log('average ',result.average);
     console.log('prevAverage ',result.prevAverage);
     console.log('highest ',result.highest);
     console.log('prevHighest ',result.prevHighest);
     console.log('lowest ',result.lowest);
     console.log('prevLowest',result.prevLowest);
     console.log('----------');*/
    return result;
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

  // calculates the % variation between the current and previous period
  calculateShift(actual: Array<Number>, previous: Array<Number>, percentual: Boolean) {
    let shift: {
      highShift: number,
      lowShift: number,
      avgShift: number,
      percentual: Boolean,
    };
    shift = {highShift: 0, lowShift: 0, avgShift: 0, percentual: true};
    shift.percentual = percentual;

    if (percentual) {
      shift.highShift = (previous[0] === 0) ? 1 : (actual[0].valueOf() - previous[0].valueOf());
      shift.lowShift = (previous[1] === 0) ? 1 : (actual[1].valueOf() - previous[1].valueOf());
      shift.avgShift = (previous[2] === 0) ? 1 : (actual[2].valueOf() - previous[2].valueOf());
    } else {
      shift.highShift = (previous[0] === 0) ? 1 : (actual[0].valueOf() / previous[0].valueOf());
      shift.lowShift = (previous[1] === 0) ? 1 : (actual[1].valueOf() / previous[1].valueOf());
      shift.avgShift = (previous[2] === 0) ? 1 : (actual[2].valueOf() / previous[2].valueOf());
    }

    if (previous[0] === actual[0])
      shift.highShift = 0;
    if (previous[1] === actual[1])
      shift.lowShift = 0;
    if (previous[2] === actual[2])
      shift.avgShift = 0;
    /*
    console.log('highShift: '+shift.highShift);
    console.log('avgShift: '+shift.avgShift);
    console.log('lowShift: '+shift.lowShift);
*/
    return shift;
  }

  updateAggregatedIntervals(newInterval: IntervalDate, aggregatedData) {

    aggregatedData.interval = newInterval;
    aggregatedData.previousInterval = this.getPrevious(newInterval);
  }
}
