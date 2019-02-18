/* Filter Actions */

import {Injectable} from '@angular/core';
import {NgRedux, select} from '@angular-redux/store';
import {IAppState} from '../../../shared/store/model';
import {IntervalDate} from './filter.model';
import {ChartsCallsService} from '../../../shared/_services/charts_calls.service';
import {Observable} from 'rxjs';
import {DashboardCharts} from '../../../shared/_models/DashboardCharts';
import {parseDate} from 'ngx-bootstrap';
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
    private Redux: NgRedux<IAppState>,
    private CCService: ChartsCallsService,
    private ADService: AggregatedDataService
  ) {
    this.filter.subscribe(elements => {
      this.originalData = elements['originalData'];
      this.filteredData = elements['dataFiltered'];

    });
  }

  initData(originalData, dateInterval: IntervalDate) {
    originalData.chartData = this.CCService.initFormatting(originalData.chart_id, originalData.chartData);
    let original = originalData != null ? originalData : [];
    let filtered = originalData != null ? JSON.parse(JSON.stringify(originalData)) : [];

    this.Redux.dispatch({type: FILTER_INIT, originalData: original, originalInterval: dateInterval, dataFiltered: filtered});
  }

  filterData(dateInterval: IntervalDate) {
    const filteredData = this.filterByDateInterval(this.originalData, dateInterval);
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

  filterByDateInterval(unfiltered, filterInterval: IntervalDate) {


    const unfilteredData = JSON.parse(JSON.stringify(unfiltered)); // Looses the reference to original data
    const filtered = [];



    const FACEBOOK_TYPE = 1;
    const GOOGLE_TYPE = 2;
    const INSTAGRAM_TYPE = 3;

    if (unfilteredData) {

      for (let i = 0; i < unfilteredData.length; i++) {

        const chart = unfilteredData[i];

        if (chart.type == GOOGLE_TYPE) { // Google Analytics charts

          let tmpData = [];
          let datatable = chart.chartData.dataTable;
          let chartClass = chart.chartData.chartClass || -1;

          if (chartClass == 6 || chartClass == 7 || chartClass == 9 || chartClass == 12) { //Google Pie Sources Chart OR Google Columns Sources Chart
                                                                        // OR Google Browser Chart OR Google Most Visited
            let partialData = [];
            let labels = [];

            datatable.forEach(el => partialData.push([el[0], new Date(el[1]), el[2]]));
            partialData = partialData.filter(el => el[1] >= filterInterval.first && el[1] <= filterInterval.last);

            for (let i = 0; i < partialData.length; i++) {

              let x = labels.findIndex(el => el[0] == partialData[i][0]); // if LABELS contains the current label, give me the index

              if (x !== -1) {
                labels[x][1] = labels[x][1] + parseInt(partialData[i][2], 10);
              }
              else {
                labels.push([partialData[i][0], partialData[i][2]]);
              }
            }

            if(chartClass == 7 || chartClass == 12) { // add blank cells to browser chart
              let paddingRows = 0;
              paddingRows = labels.length % 10 ? 10 - (labels.length % 10) : 0;
              for (let i = 0; i < paddingRows; i++){
                labels.push([null,null]);
              }
            }

            tmpData.push([datatable[0][0], datatable[0][2]]);
            tmpData = tmpData.concat(labels);
          }
          else {
            console.log("FILTER ACTION datatable");
            console.log(datatable);
            datatable.forEach(el => tmpData.push([new Date(el[0]), el[1]]));
            tmpData = tmpData.filter(el => el[0] >= filterInterval.first && el[0] <= filterInterval.last);

            tmpData = [datatable.shift()].concat(tmpData);
            console.log("FILTER ACTION tmpData");
            console.log(tmpData);
          }
          chart.chartData.dataTable = tmpData; // Concatening header

          //if (chartClass == 11) {
          //  this.ADService.updateAggregatedIntervals(filterInterval, chart.aggregated); // Updating aggregated data
          //}

          chart.chartData = this.CCService.formatChart(chart.chart_id, tmpData);
          chart.aggregated = this.ADService.getAggregatedData(tmpData, chart.chart_id, filterInterval);

          filtered.push(chart);

          console.log("FILTER ACTION chart");
          console.log(chart);

        } else if (chart.type == FACEBOOK_TYPE || chart.type == INSTAGRAM_TYPE) { // Facebook Insights charts

          let tmpData = [];

          // If the chart is a geomap or a pie, it just take data of the last day of the interval
          if (this.CCService.containsGeoData(chart)) {

            tmpData = chart.geoData.filter(el => (new Date(el.end_time)) <= (new Date(filterInterval.last)));
            chart.chartData = this.CCService.formatChart(chart.chart_id, tmpData);
          } else {

            let datatable = chart.chartData.dataTable;

            datatable.forEach(el => tmpData.push([new Date(el[0]), el[1]]));
            tmpData = tmpData.filter(el => el[0] >= filterInterval.first && el[0] <= filterInterval.last);

            // TODO handle aggregated data here

            chart.chartData.dataTable = [datatable.shift()].concat(tmpData); // Concatening header
          }

          //this.ADService.updateAggregatedIntervals(filterInterval, chart.aggregated); // Updating aggregated data

          filtered.push(chart);

        } else {
          console.error('Error in FILTER_ACTIONS. A chart of unknown type (' + chart.type + ') was found, filter action skipped.');
          console.error('MORE DETAILS (unfiltered data in input):');
          console.error(chart);
        }
      }
    }
    else {
      console.error('Error in FILTER_ACTIONS. No unfiltered data found.');
      console.error(unfilteredData);
    }

    return filtered;
  }

  clear() {
    this.Redux.dispatch({type: FILTER_CLEAR});
  }
}
