/* Filter Actions */

import {Injectable} from '@angular/core';
import {NgRedux, select} from '@angular-redux/store';
import {IAppState} from '../../../shared/store/model';
import {IntervalDate} from './filter.model';
import {ChartsCallsService} from '../../../shared/_services/charts_calls.service';
import {forkJoin, Observable} from 'rxjs';
import {DashboardCharts} from '../../../shared/_models/DashboardCharts';
import {GlobalEventsManagerService} from '../../../shared/_services/global-event-manager.service';
import {AggregatedDataService} from '../../../shared/_services/aggregated-data.service';

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
    private ngRedux: NgRedux<IAppState>,
    private CCService: ChartsCallsService,
    private ADService: AggregatedDataService,
    private GEEmitter: GlobalEventsManagerService
  ) {
    this.filter.subscribe(elements => {
      this.originalData = elements['originalData'];
      this.filteredData = elements['dataFiltered'];
    });
  }

  initData(originalData, dataFiltered, dateInterval: IntervalDate) {

    this.ngRedux.dispatch({type: FILTER_INIT, originalData: originalData, originalInterval: dateInterval, dataFiltered: dataFiltered});
    //this.filterData(dateInterval);
  }

  filterData(dateInterval: IntervalDate) {
    const filteredData = this.filterByDateInterval(this.originalData, dateInterval);

    this.ngRedux.dispatch({type: FILTER_BY_DATA, dataFiltered: filteredData, filterInterval: dateInterval});
  }

  updateChart(index: number, newTitle: string) {
    this.originalData[index].title = newTitle;
    this.filteredData[index].title = newTitle;

    this.ngRedux.dispatch({type: FILTER_UPDATE, originalData: this.originalData, dataFiltered: this.filteredData});
  }

  addChart(chart: DashboardCharts) {
    this.originalData.push(chart);
    this.filteredData.push(Object.assign({}, chart));

    this.ngRedux.dispatch({type: FILTER_UPDATE, originalData: this.originalData, dataFiltered: this.filteredData});
  }

  removeChart(id: number) {
    this.originalData = this.originalData.filter((chart) => chart.chart_id !== id);
    this.filteredData = this.filteredData.filter((chart) => chart.chart_id !== id);

    this.ngRedux.dispatch({type: FILTER_UPDATE, originalData: this.originalData, dataFiltered: this.filteredData});
  }

  filterByDateInterval(unfilteredData, filterInterval: IntervalDate) {

    const unfiltered = JSON.parse(JSON.stringify(unfilteredData)); // Losing the reference to original data
    const filtered = [];
    const observables: Observable<any>[] = [];
    const chartsToRetrieve: Array<DashboardCharts> = [];

    const FACEBOOK_TYPE = 1;
    const GOOGLE_TYPE = 2;

    if (unfiltered) {

      console.log(unfiltered);

      for (let i=0; i < unfiltered.length; i++) {

        const chart = unfiltered[i];

        if (chart.type == GOOGLE_TYPE) { // Google Analytics charts

          // TODO fix this

          // Puts into 'observables' all the calls to do
          //observables.push(this.chartCallService.retrieveChartData(chartID, filterInterval));
          //chartsToRetrieve.push(item);

        } else if (chart.type == FACEBOOK_TYPE) { // Facebook Insights charts

          let tmpData = [];

          // If the chart is a geomap, it just take data of the last day of the interval
          if (chart.format === 'geomap') {

            tmpData = chart.geoData.filter(el => (new Date(el.end_time)) <= (new Date(filterInterval.dataEnd)));
            chart.chartData = this.CCService.formatChart(chart.chart_id, tmpData);
          } else {

            let datatable = chart.chartData.dataTable;

            datatable.forEach(el => tmpData.push([new Date(el[0]), el[1]]));
            tmpData = tmpData.filter(el => el[0] >= filterInterval.dataStart && el[0] <= filterInterval.dataEnd);

            chart.chartData.dataTable = [datatable.shift()].concat(tmpData); // Concatening header
          }

          filtered.push(chart);

        } else {
          console.log('Error in FILTER_ACTIONS. A chart of unknown type (' + chart.type + ') was found, filter action skipped.');
          console.log('MORE DETAILS (unfiltered data in input):');
          console.log(chart);
        }
      }

      if (observables.length !== 0) { // If there are observables, then there are Google Analytics data charts to retrieve doing API calls

        forkJoin(observables)
          .subscribe(dataArray => {

            for (let i = 0; i < dataArray.length; i++) {

              if (!dataArray[i]['status']) { // Se la chiamata non rende errori
                const newData = this.CCService.formatChart(chartsToRetrieve[i].chart_id, dataArray[i]);

                chartsToRetrieve[i].aggregated = this.ADService.getAggregatedData(dataArray[i], chartsToRetrieve[i].chart_id);
                chartsToRetrieve[i].chartData['dataTable'] = newData.data['dataTable'];
                filtered.push(chartsToRetrieve[i]);
              } else {
                console.log('Errore per il grafico ' + chartsToRetrieve[i].title);
                console.log(chartsToRetrieve[i]);
                filtered.push(chartsToRetrieve[i]);
              }
            }

            this.GEEmitter.loadingScreen.next(false);
          });
      }
    }
    else {
      console.log('Error in FILTER_ACTIONS. No unfiltered data found.');
      console.log(unfiltered);
    }

    return filtered;
  }

  clear() {
    this.ngRedux.dispatch({type: FILTER_CLEAR});
  }
}
