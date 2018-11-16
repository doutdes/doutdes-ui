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

  private cutString(str, maxLength) {
    return str.length > maxLength ? str.substr(0, 30) + '...' : str;
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
      case 10:
        return this.googleAnalyticsService.gaBounceRate(intervalDate);
      case 11:
        return this.googleAnalyticsService.gaAvgSessionDuration(intervalDate);
      case 12:
        return this.googleAnalyticsService.gaBrowsers(intervalDate);
      case 13:
        return this.facebookService.fbpageviewstotal();
    }
  }

  public formatDataByChartId(ID, data) {
    let dataFormat;
    let header;
    const chartArray = [];
    const impressChartArray = [];
    let paddingRows = 0;

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
            colors: ['#63c2de'],
            colorAxis: {colors: ['#9EDEEF', '#63c2de']},
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
            colors: ['#63c2de'],
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
            colors: ['#FFA647'],
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
            colors: ['#FFA647'],
            areaOpacity: 0.4
          }
        };
        break; // Google Sessions
      case 6: // google pie begin
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
            is3D: false,
            pieSliceText: 'label',
            pieSliceTextStyle: {fontSize: 16, color: '#222'},
            colors: ['#FFAF60', '#FFBD7F', '#FFCB9B', '#FFD7B5', '#FFE2CC'],
            areaOpacity: 0.4
          }
        };
        break; // google pie end
      case 7:
        header = [['Website', 'Views']];
        paddingRows = data.length % 10 ? 10 - (data.length % 10) : 0; // if data.length % 10 != 0, add padding

        console.log('DATI: ' + data.length + '\nPADDING: ' + paddingRows);

        for (let i = 0; i < data.length + paddingRows; i++) {
          if (i >= data.length) {
            chartArray.push(['', null]);
          } else {
            chartArray.push([this.cutString(data[i][0], 30), parseInt(data[i][1], 10)]);
          }
        }
        dataFormat = {
          chartType: 'Table',
          dataTable: header.concat(chartArray),
          options: {
            alternatingRowStyle: true,
            allowHtml: true,
            sort: 'enable',
            sortAscending: false,
            sortColumn: 1,
            pageSize: 10,
            height: '100%',
            width: '100%'
          }
        };
        break; // Google List Refferal
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
            // is3D: true,
            colors: ['#63c2de'],
            pieSliceText: 'label',
            pieSliceTextStyle: {fontSize: 13, color: 'black'},
            pieHole: 0.1,
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
            colors: ['#FFC993'],
            areaOpacity: 0.4
          }
        };
        break; // Google Sources Column Chart

      case 10:
        header = [['Date', 'BounceRate']];
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
            colors: ['#FFA647'],
            areaOpacity: 0.4
          }
        };
        break; // Google BounceRate
      case 11:
        header = [['Date', 'Time (s)']];
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
            colors: ['#FFA647'],
            areaOpacity: 0.4
          }
        };
        break; // Google Average Session Duration
      case 12:
        header = [['Browser', 'Sessions']];

        paddingRows = data.length % 10 ? 10 - (data.length % 10) : 0;

        for (let i = 0; i < data.length + paddingRows; i++) {
          if (i >= data.length) {
            chartArray.push(['', null]);
          } else {
            chartArray.push([this.cutString(data[i][0], 30), parseInt(data[i][1], 10)]);
          }
        }
        dataFormat = {
          chartType: 'Table',
          dataTable: header.concat(chartArray),
          options: {
            alternatingRowStyle: true,
            sortAscending: false,
            sortColumn: 1,
            pageSize: 10,
            height: '100%',
            width: '100%'
          }
        };
        break; // Google list sessions per browser

      case 13:

        header = [['Date', 'Views']];
        // Push data pairs in the Chart array
        for (let i = 0; i < data.length; i++) {
          chartArray.push([new Date(data[i].end_time), data[i].value]);
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
    }
    return dataFormat;
  }

}
