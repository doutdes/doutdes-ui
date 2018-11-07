/* Filter Actions */

import {Injectable} from '@angular/core';
import {NgRedux, select} from '@angular-redux/store';
import {IAppState} from '../../../shared/store/model';
import {IntervalDate} from './filter.model';
import {ChartsCallsService} from '../../../shared/_services/charts_calls.service';
import {Chart} from '../../../shared/_models/Chart';
import {Observable} from 'rxjs';
import {GoogleAnalyticsService} from '../../../shared/_services/googleAnalytics.service';
import {first} from 'rxjs/operators';

export const FILTER_INIT = 'FILTER_INIT';
export const FILTER_RESET = 'FILTER_RESET';
export const FILTER_CLEAR = 'FILTER_CLEAR';
export const FILTER_BY_DATA = 'FILTER_BY_DATA';

@Injectable()
export class FilterActions {

  @select() filter: Observable<any>;
  originalData: any;

  constructor(
    private ngRedux: NgRedux<IAppState>,
    private chartCallService: ChartsCallsService,
    private googleAnalyticsService: GoogleAnalyticsService
  ) {
    this.filter.subscribe(elements => {
      this.originalData = elements['originalData'];
    });
  }

  initData(originalData, dateInterval: IntervalDate) {
    this.ngRedux.dispatch({type: FILTER_INIT, originalData: originalData, originalInterval: dateInterval});
  }

  filterData(dateInterval: IntervalDate) {

    // this.filterByDate(JSON.stringify(this.originalData), dateInterval);
    //
    const filteredData = this.filterByDate(JSON.stringify(this.originalData), dateInterval);

    this.ngRedux.dispatch({type: FILTER_BY_DATA, dataFiltered: filteredData, filterInterval: dateInterval});
  }

  clear() {
    this.ngRedux.dispatch({type: FILTER_CLEAR});
  }

  async filterByDate(originalData, filterInterval: IntervalDate){

    let originalReceived = JSON.parse(originalData);
    let filtered = [];

    if (originalReceived) {
      originalReceived.forEach(chart => {

        console.log(chart['Chart']['title']);

        if (chart['title'] !== 'Geomap') { // TODO Eliminare
          if (chart['Chart']['type'] == 2) {

            const pdpm = this.chartCallService.getDataByChartId(chart['Chart']['id'], filterInterval)
              .subscribe(data => {
                let newData = this.chartCallService.formatDataByChartId(chart['Chart']['id'], data);

                chart['chartData']['dataTable'] = newData['dataTable'];
                console.log(filtered);
              });

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

}
