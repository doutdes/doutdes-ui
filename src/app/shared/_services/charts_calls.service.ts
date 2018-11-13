import {Injectable} from '@angular/core';
import {FacebookService} from './facebook.service';
import {Observable} from 'rxjs';
import {GoogleAnalyticsService} from './googleAnalytics.service';
import {parseDate} from 'ngx-bootstrap/chronos';
import {IntervalDate} from '../../features/dashboard/redux-filter/filter.model';

@Injectable()
export class ChartsCallsService {

  constructor(private facebookService: FacebookService, private googleAnalyticsService: GoogleAnalyticsService) {
  }

  public getDataByChartId(ID, intervalDate?: IntervalDate): Observable<any> {
    switch (ID) {
      case 1:
        return this.facebookService.fbfancount();
      case 2:
        return this.facebookService.fbfancountry();
      case 3:
        return this.facebookService.fbpageimpressions();
      case 4:
        return this.googleAnalyticsService.gaPageViews(intervalDate);
      case 5:
        return this.googleAnalyticsService.gaSessions(intervalDate);
      case 6:
        return this.googleAnalyticsService.gaSources(intervalDate);
      case 7:
        return this.googleAnalyticsService.gaMostViews(intervalDate);
      case 8:
        return this.facebookService.fbfancountry();
      case 9:
        return this.googleAnalyticsService.gaSources(intervalDate);
    }
  }

  public formatDataByChartId(ID, data) {
    let dataFormat;
    let header;
    const chartArray = [];
    const impressChartArray = [];

    switch (ID) {
      case 1:

        header = [['Date', 'Number of fans']];

        // Push data pairs in the Chart array
        for (let i = 0; i < data.length; i++) {

          // if (i % 10 === 0) { // Data are greedy sampled by 10 units
          chartArray.push([new Date(data[i].end_time), data[i].value]); // [data[i].end_time, data[i].value]);
          // }
        }

        dataFormat = {
          chartType: 'AreaChart',
          dataTable: header.concat(chartArray),
          options: {
            chartArea: {left: 30, right: 0, height: 280, top: 0},
            legend: {position: 'none'},
            curveType: 'function',
            height: 310,
            explorer: {},
            colors: ['#63c2de'],
            areaOpacity: 0.4
          }
        };

        break; // Fb Fan Count
      case 2:
        header = [['Country', 'Popularity']];
        const arr = Object.keys(data[0].value).map(function (k) {
          return [k, data[0].value[k]];
        });

        dataFormat = {
          chartType: 'GeoChart',
          dataTable: header.concat(arr),
          options: {
            region: 'world',
            colors: ['#EF7C7C'],
            colorAxis: {colors: ['#F7DEDE', '#EF7C7C']},
            backgroundColor: '#fff',
            datalessRegionColor: '#eee',
            defaultColor: '#333',
            height: '300'
          }
        };
        break; // Geo Map
      case 3:
        header = [['Date', 'Impressions']];

        for (let i = 0; i < data.length; i++) {

          // if (i % 2 === 0) {
          impressChartArray.push([new Date(data[i].end_time), data[i].value]);
          // }
        }

        dataFormat = {
          chartType: 'AreaChart',
          dataTable: header.concat(impressChartArray),
          options: {
            chartArea: {left: 30, right: 0, height: 280, top: 0},
            legend: {position: 'none'},
            curveType: 'function',
            height: 310,
            explorer: {},
            colors: ['#8CCEA0'],
            areaOpacity: 0.4
          }
        };
        break; // Page Impressions
      case 4:
        header = [['Date', 'WebViews']];
        // Push data pairs in the Chart array

        // console.log(data);

        for (let i = 0; i < data.length; i++) {
          chartArray.push([parseDate(data[i][0]), parseInt(data[i][1], 10)]);
        }

        dataFormat = {
          chartType: 'AreaChart',
          dataTable: header.concat(chartArray),
          options: {
            chartArea: {left: 30, right: 0, height: 280, top: 0},
            legend: {position: 'none'},
            curveType: 'function',
            height: 310,
            explorer: {},
            colors: ['#EF7C7C'],
            areaOpacity: 0.4
          }
        };
        break; // Google PageViews
      case 5:
        header = [['Date', 'Sessions']];
        // Push data pairs in the Chart array
        for (let i = 0; i < data.length; i++) {
          chartArray.push([parseDate(data[i][0]), parseInt(data[i][1], 10)]);
        }

        dataFormat = {
          chartType: 'AreaChart',
          dataTable: header.concat(chartArray),
          options: {
            chartArea: {left: 30, right: 0, height: 280, top: 0},
            legend: {position: 'none'},
            curveType: 'function',
            height: 310,
            explorer: {},
            colors: ['#63c2de'],
            areaOpacity: 0.4
          }
        };
        break; // Google Sessions
      case 6:
        header = [['Type', 'Number']];

        // Push data pairs in the Chart array
        for (let i = 0; i < data.length; i++) {
          chartArray.push([data[i][0] === '(none)' ? 'unknown' : data[i][0], parseInt(data[i][1], 10)]);
          // Ternary operator trivially replaces 'none' with 'unknown'
        }
        dataFormat = {
          chartType: 'PieChart',
          dataTable: header.concat(chartArray),
          options: {
            chartArea: {left: 30, right: 0, height: 280, top: 0},
            legend: {position: 'none'},
            height: 310,
            is3D: true,
            pieSliceText: 'label',
            pieSliceTextStyle: {fontSize: 13, color: 'black'},
            colors: ['#8CCEA0', '#e3eaa7', '#b5e7a0', '#86af49'],
            areaOpacity: 0.4
          }
        };
        break; // Google Sources Pie
      case 7:
        header = [['Website', 'Number Of Views']];
        for (let i = 0; i < data.length; i++) {
          chartArray.push([data[i][0], parseInt(data[i][1], 10)]);
        }
        dataFormat = {
          chartType: 'Table',
          dataTable: header.concat(chartArray),
          options: {
            alternatingRowStyle: true,
            allowHtml: true
          }
        };
        break; // Google Table
      case 8:
        header = [['Country', 'Popularity']];
        // Push data pairs in the Chart array
        const arrPie = Object.keys(data[0].value).map(function (k) {
          return [k, data[0].value[k]];
        });
        dataFormat = {
          chartType: 'PieChart',
          dataTable: header.concat(arrPie),
          options: {
            chartArea: {left: 0, right: 0, height: 280, top: 0},
            legend: {position: 'none'},
            sliceVisibilityThreshold: 0.05,
            height: 310,
            is3D: true,
            pieSliceText: 'label',
            pieSliceTextStyle: {fontSize: 13, color: 'black'},
            pieHole: 0.2,
            slices: [{color: '#003f5c'}, {color: '#2f4b7c'}, {color: '#665191'}, {color: '#a05195'}],
            areaOpacity: 0.4
          }
        };
        break; // Fan Country Pie
      case 9:
        header = [['Type', 'Number']];
        // Push data pairs in the Chart array
        for (let i = 0; i < data.length; i++) {
          chartArray.push([data[i][0] === '(none)' ? 'unknown' : data[i][0], parseInt(data[i][1], 10)]);
          // Ternary operator trivially replaces 'none' with 'unknown'
        }
        dataFormat = {
          chartType: 'ColumnChart',
          dataTable: header.concat(chartArray),
          options: {
            chartArea: {left: 30, right: 0, height: 280, top: 0},
            legend: {position: 'none'},
            height: 310,
            colors: ['#618685'],
            areaOpacity: 0.4
          }
        };
        break; // Google Sources Column Chart
    }
    return dataFormat;
  }

}
