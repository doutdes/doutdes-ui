/* Filter Actions */

import {Injectable} from '@angular/core';
import {NgRedux, select} from '@angular-redux/store';
import {IAppState} from '../../../shared/store/model';
import {IntervalDate} from './filter.model';
import {ChartsCallsService} from '../../../shared/_services/charts_calls.service';
import {Observable} from 'rxjs';
import {DashboardCharts} from '../../../shared/_models/DashboardCharts';
import {AggregatedDataService} from '../../../shared/_services/aggregated-data.service';
import {D_TYPE, DS_TYPE} from '../../../shared/_models/Dashboard';
import {parseDate} from 'ngx-bootstrap';


export const FILTER_INIT = 'FILTER_INIT';
export const FILTER_UPDATE = 'FILTER_UPDATE';
export const FILTER_BY_DATA = 'FILTER_BY_DATA';
export const FILTER_RESET = 'FILTER_RESET';
export const FILTER_CLEAR = 'FILTER_CLEAR';


@Injectable()
export class FilterActions {

  @select() filter: Observable<any>;
  originalData: any;
  filteredData: any;

  constructor(
    private Redux: NgRedux<IAppState>,
    private CCService: ChartsCallsService,
    private ADService: AggregatedDataService
  ) {
    this.filter.subscribe(elements => {
      this.originalData = elements['originalData'];
      this.filteredData = elements['dataFiltered'];

    });
  }

  /**
   * It receives the original data and it stores them as they are
   * After this, it requires for the right format of the data and it stores this in the formatted data
   **/
  initData(originalData, dateInterval: IntervalDate) {
    let original = originalData || [];
    let filtered = originalData ? JSON.parse(JSON.stringify(originalData)) : [];
    let initialised: null;
    let chart_id;

    // Given the original data, it retrieves the right format for the data
    if (filtered) {
      for (let i in filtered) {
        chart_id = filtered[i].chart_id;
        initialised = this.CCService.initFormatting(chart_id, filtered[i].chartData);
        filtered[i].chartData = this.CCService.formatChart(chart_id, initialised);
      }
    }

    this.Redux.dispatch({type: FILTER_INIT, originalData: original, originalInterval: dateInterval, dataFiltered: filtered});
  }

  filterData(dateInterval: IntervalDate) {
    const filteredData = this.filterByDateInterval(dateInterval);
    this.Redux.dispatch({type: FILTER_BY_DATA, dataFiltered: filteredData, filterInterval: dateInterval});
  }

  updateChart(index: number, newTitle: string) {
    this.originalData[index].title = newTitle;
    this.filteredData[index].title = newTitle;

    this.Redux.dispatch({type: FILTER_UPDATE, originalData: this.originalData, dataFiltered: this.filteredData});
  }

  addChart(chart: DashboardCharts) {

    chart.chartData = this.CCService.initFormatting(chart.chart_id, chart.chartData);
    this.originalData.push(chart);
    this.filteredData.push(JSON.parse(JSON.stringify(chart)));

    this.Redux.dispatch({type: FILTER_UPDATE, originalData: this.originalData, dataFiltered: this.filteredData});

  }

  removeChart(id: number) {
    let original = this.originalData.filter((chart) => chart.chart_id !== id);
    let filtered = this.filteredData.filter((chart) => chart.chart_id !== id);

    this.Redux.dispatch({type: FILTER_UPDATE, originalData: original, dataFiltered: filtered});
  }

  filterByDateInterval(filterInterval: IntervalDate) {
    const unfilteredData = JSON.parse(JSON.stringify(this.originalData)); // Looses the reference to original data
    const filtered = [];
    let chart;

    console.log('arrivo');

    if (unfilteredData) {
      for (let i = 0; i < unfilteredData.length; i++) {
        chart = unfilteredData[i];

        // If the type of the chart is known
        if (DS_TYPE.hasOwnProperty(chart.type)) {

          console.warn('dati preordinamento', JSON.parse(JSON.stringify(chart)));

          chart.chartData = chart.type === D_TYPE.GA || chart.type === D_TYPE.YT
            ? chart.chartData.filter(el => parseDate(el[0]) >= filterInterval.first && parseDate(el[0]) <= filterInterval.last)
            : chart.chartData.filter(el => (new Date(el.end_time)) >= filterInterval.first && (new Date(el.end_time)) <= filterInterval.last);

          console.warn('dati post', JSON.parse(JSON.stringify(chart)));

          chart.chartData = this.CCService.formatChart(chart.chart_id, this.CCService.initFormatting(chart.chart_id, chart.chartData));
          chart.aggregated = this.ADService.getAggregatedData(chart.chartData, chart.chart_id, filterInterval);

          filtered.push(chart);

        } else {
          console.error('Error in FILTER_ACTIONS. A chart of unknown type (' + chart.type + ') was found, filter action skipped.');
          console.error('MORE DETAILS (unfiltered data in input):');
          console.error(chart);
        }
      }
    } else {
      console.error('Error in FILTER_ACTIONS. No unfiltered data found.');
      console.error(unfilteredData);
    }

    return filtered;
  }

  clear() {
    this.Redux.dispatch({type: FILTER_CLEAR});
  }
}
