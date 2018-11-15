/* Filter Actions */

import {Injectable} from '@angular/core';
import {NgRedux, select} from '@angular-redux/store';
import {IAppState} from '../../../shared/store/model';
import {IntervalDate} from './filter.model';
import {ChartsCallsService} from '../../../shared/_services/charts_calls.service';
import {forkJoin, Observable} from 'rxjs';
import {DashboardCharts} from '../../../shared/_models/DashboardCharts';
import {GlobalEventsManagerService} from '../../../shared/_services/global-event-manager.service';
import {element} from 'protractor';

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
    private chartCallService: ChartsCallsService,
    private globalEventEmitter: GlobalEventsManagerService
  ) {
    this.filter.subscribe(elements => {
      this.originalData = elements['originalData'];
      this.filteredData = elements['dataFiltered'];
    });
  }

  initData(originalData, dataFiltered, dateInterval: IntervalDate) {
    this.ngRedux.dispatch({type: FILTER_INIT, originalData: originalData, originalInterval: dateInterval, dataFiltered: dataFiltered});
  }

  filterData(dateInterval: IntervalDate) {
    const filteredData = this.filterByDate(JSON.stringify(this.originalData), dateInterval);

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

  filterByDate(originalData, filterInterval: IntervalDate) {

    const originalReceived = JSON.parse(originalData);
    const filtered = [];
    const observables: Observable<any>[] = [];
    const chartsToRetrieve: Array<DashboardCharts> = [];

    if (originalReceived) {

      originalReceived.forEach(chart => {

          if (chart['Chart']) {

            if (chart['Chart']['type'] === 2) { // Grafici di Google Analytics

              console.log(chart);
              console.log(chart['Chart']['id']);

              // In un array vengono inserite tutte le chiamate da effettuare
              observables.push(this.chartCallService.getDataByChartId(chart['Chart']['id'], filterInterval));
              chartsToRetrieve.push(chart);

            } else { // Grafici di Facebook

              const header = [chart['chartData']['dataTable'].shift()];
              let newArray = [];

              if(chart['Chart']['title'] === 'Fans by country') { // Se un grafico è di tipo geomap, recupera i dati da geoData e li filtra
                newArray = chart['geoData'].filter(element => (new Date(element['end_time'])) <= (new Date(filterInterval.dataEnd)));
                chart['chartData'] = this.chartCallService.formatDataByChartId(chart['Chart']['id'], newArray);
              } else {
                chart['chartData']['dataTable'].forEach(element => newArray.push([new Date(element[0]), element[1]]));
                newArray = newArray.filter(element => element[0] >= filterInterval.dataStart && element[0] <= filterInterval.dataEnd);
                chart['chartData']['dataTable'] = header.concat(newArray);
              }

              filtered.push(chart);
            }
          }
      });

      if (observables.length !== 0) { // If there are observables, then there are Google Analytics data charts to retrieve doing API calls

        console.log(observables);

        forkJoin(observables)
          .subscribe(dataArray => {

            for (let i = 0; i < dataArray.length; i++) {

              if (!dataArray[i]['status']) { // Se la chiamata non rende errori
                const newData = this.chartCallService.formatDataByChartId(chartsToRetrieve[i].chart_id, dataArray[i]);

                chartsToRetrieve[i].chartData['dataTable'] = newData['dataTable'];
                filtered.push(chartsToRetrieve[i]);
              } else {
                console.log('Errore per il grafico ' + chartsToRetrieve[i].title);
                console.log(chartsToRetrieve[i]);
                filtered.push(chartsToRetrieve[i]);
              }
            }

            this.globalEventEmitter.loadingScreen.next(false);
          });
      }
    }

    // this.globalEventEmitter.loadingScreen.next(false);
    return filtered;
  }

  clear() {
    this.ngRedux.dispatch({type: FILTER_CLEAR});
  }
}
