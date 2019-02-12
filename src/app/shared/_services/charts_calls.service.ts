import {Injectable} from '@angular/core';
import {FacebookService} from './facebook.service';
import {InstagramService} from './instagram.service';
import {Observable} from 'rxjs';
import {GoogleAnalyticsService} from './googleAnalytics.service';
import {parseDate} from 'ngx-bootstrap/chronos';
import {IntervalDate} from '../../features/dashboard/redux-filter/filter.model';
import {DashboardCharts} from '../_models/DashboardCharts';
import {k} from '@angular/core/src/render3';

@Injectable()
export class ChartsCallsService {

  constructor(private facebookService: FacebookService, private googleAnalyticsService: GoogleAnalyticsService, private InstagramService: InstagramService) {
  }

  public static cutString(str, maxLength) {
    return str.length > maxLength ? str.substr(0, 30) + '...' : str;
  }

  public retrieveChartData(ID, pageID?, intervalDate?: IntervalDate): Observable<any> {
    switch (ID) {
      case 1:
        return this.facebookService.fbfancount(pageID);
      case 2:
        return this.facebookService.fbfancountry(pageID);
      case 3:
        return this.facebookService.fbpageimpressions(pageID);
      case 4:
        return this.googleAnalyticsService.gaPageViews(intervalDate);
      case 5:
        return this.googleAnalyticsService.gaSessions(intervalDate);
      case 6:
        return this.googleAnalyticsService.gaSources(intervalDate);
      case 7:
        return this.googleAnalyticsService.gaMostViews(intervalDate);
      case 8:
        return this.facebookService.fbfancountry(pageID);
      case 9:
        return this.googleAnalyticsService.gaSources(intervalDate);
      case 10:
        return this.googleAnalyticsService.gaBounceRate(intervalDate);
      case 11:
        return this.googleAnalyticsService.gaAvgSessionDuration(intervalDate);
      case 12:
        return this.googleAnalyticsService.gaBrowsers(intervalDate);
      case 13:
        return this.facebookService.fbpageviewstotal(pageID);
      case 14:
        return this.facebookService.fbfancity(pageID);
      case 15:
      case 16:
      case 17:
      case 18:
      case 19:
        return this.InstagramService.getAnyData(pageID, ID);
      case 24:
      case 25:
      case 26:
      case 27:
      case 28:
      case 20:
      case 21:
      case 22:
      case 23:
        return this.InstagramService.getNumericData(pageID, ID);


    }
  }

  public formatChart(ID, data) {
    let formattedData;
    let header;
    let type;
    let chartArray = [];
    const impressChartArray = [];
    let paddingRows = 0;
    let arr = [];

    switch (ID) {
      case 1:

        header = [['Date', 'Number of fans']];

        // Push data pairs in the Chart array
        for (let i = 0; i < data.length; i++) {

          // if (i % 10 === 0) { // Data are greedy sampled by 10 units
          chartArray.push([new Date(data[i].end_time), data[i].value]); // [data[i].end_time, data[i].value]);
          // }
        }

        formattedData = {
          chartType: 'AreaChart',
          dataTable: header.concat(chartArray),
          chartClass: 1,
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

        arr = Object.keys(data[data.length - 1].value).map(function (k) {
          return [k, data[data.length - 1].value[k]];
        });

        formattedData = {
          chartType: 'GeoChart',
          dataTable: header.concat(arr),
          chartClass: 2,
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
          impressChartArray.push([new Date(data[i].end_time), data[i].value]);
        }

        console.log(JSON.parse(JSON.stringify(impressChartArray)));


        formattedData = {
          chartType: 'AreaChart',
          dataTable: header.concat(impressChartArray),
          chartClass: 3,
          options: {
            chartArea: {left: 40, right: 0, height: 280, top: 0},
            legend: {position: 'none'},
            format: 'decimal',
            curveType: 'function',
            height: 310,
            explorer: {},
            colors: ['#63c2de'],
            areaOpacity: 0.4
          }
        };
        break; // Page Impressions
      case 4:
        header = [['Date', 'Impressions']];
        // Push data pairs in the Chart array

        // console.log(data);

        for (let i = 0; i < data.length; i++) {
          chartArray.push([parseDate(data[i][0]), parseInt(data[i][1], 10)]);
        }


        formattedData = {
          chartType: 'AreaChart',
          dataTable: header.concat(chartArray),
          chartClass: 5,
          options: {
            chartArea: {left: 0, right: 0, height: 190, top: 0},
            legend: {position: 'none'},
            height: 210,
            hAxis: {gridlines: {color: '#eaeaea', count: -1}, textStyle: {color: '#666', fontName: 'Roboto'}, minTextSpacing: 15},
            vAxis: {gridlines: {color: '#eaeaea', count: 5}, textPosition: 'in', textStyle: {color: '#999'}},
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

        formattedData = {
          chartType: 'AreaChart',
          dataTable: header.concat(chartArray),
          chartClass: 5,
          options: {
            chartArea: {left: 0, right: 0, height: 290, top: 0},
            legend: {position: 'none'},
            hAxis: {gridlines: {color: '#eaeaea', count: -1}, textStyle: {color: '#666', fontName: 'Roboto'}, minTextSpacing: 15},
            vAxis: {gridlines: {color: '#eaeaea', count: 5}, textPosition: 'in', textStyle: {color: '#999'}, minValue: 0},
            height: 310,
            colors: ['#FFA647'],
            areaOpacity: 0.4
          }
        };
        break; // Google Sessions
      case 6: // google pie begin
        header = [['Type', 'Date', 'Number']];

        for (let i = 0; i < data.length; i++) {
          chartArray.push([data[i][0] === '(none)' ? 'unknown' : data[i][0], parseDate(data[i][1]), parseInt(data[i][2], 10)]);
        }

        formattedData = {
          chartType: 'PieChart',
          dataTable: header.concat(chartArray),
          chartClass: 6,
          options: {
            chartArea: {left: 30, right: 0, height: 290, top: 0},
            legend: {position: 'none'},
            height: 310,
            is3D: false,
            pieSliceText: 'label',
            pieSliceTextStyle: {fontSize: 16, color: '#222'},
            colors: ['#FFAF60', '#FFBD7F', '#FFCB9B', '#FFD7B5', '#FFE2CC'],
            areaOpacity: 0.4
          }
        };
        break; // Google pie end
      case 7:
        header = [['Website', 'Views']];
        paddingRows = data.length % 10 ? 10 - (data.length % 10) : 0; // if data.length % 10 != 0, add padding

        for (let i = 0; i < data.length + paddingRows; i++) {
          if (i >= data.length) {
            chartArray.push(['', null]);
          } else {
            chartArray.push([ChartsCallsService.cutString(data[i][0], 30), parseInt(data[i][1], 10)]);
          }
        }
        formattedData = {
          chartType: 'Table',
          dataTable: header.concat(chartArray),
          chartClass: 7,
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
        const arrPie = Object.keys(data[data.length - 1].value).map(function (k) {
          return [k, data[data.length - 1].value[k]];
        });
        formattedData = {
          chartType: 'PieChart',
          dataTable: header.concat(arrPie),
          chartClass: 8,
          options: {
            chartArea: {left: 0, right: 0, height: 290, top: 0},
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
        header = [['Type', 'Date', 'Number']];

        for (let i = 0; i < data.length; i++) {
          chartArray.push([data[i][0] === '(none)' ? 'unknown' : data[i][0], parseDate(data[i][1]), parseInt(data[i][2], 10)]);
        }
        formattedData = {
          chartType: 'ColumnChart',
          dataTable: header.concat(chartArray),
          chartClass: 9,
          options: {
            chartArea: {left: 0, right: 0, height: 290, top: 0},
            legend: {position: 'none'},
            height: 310,
            vAxis: {gridlines: {color: '#eaeaea', count: 5}, textPosition: 'in', textStyle: {color: '#999'}},
            colors: ['#FFC993'],
            areaOpacity: 0.4
          }
        };
        break; // Google Sources Column Chart
      case 10:
        type = 'ga_bounce';
        header = [['Date', 'Bounce rate']];
        // Push data pairs in the Chart array

        /*
        let sum = 0.;
        highest = 0;
        lowest = 1;
        // console.log(data);
        **/

        for (let i = 0; i < data.length; i++) {
          const value = parseInt(data[i][1], 10) / 100.;
          //sum += value;
          //highest = value > highest ? value : highest;
          //lowest = value < lowest ? value : lowest;

          chartArray.push([parseDate(data[i][0]), value]);
        }

        formattedData = {
          chartType: 'AreaChart',
          dataTable: header.concat(chartArray),
          chartClass: 10,
          options: {
            chartArea: {left: 0, right: 0, height: 190, top: 0},
            legend: {position: 'none'},
            hAxis: {
              gridlines: {color: '#eaeaea', count: -1},
              textStyle: {color: '#666', fontSize: 12, fontName: 'Roboto'},
              minTextSpacing: 15
            },
            vAxis: {
              gridlines: {color: '#eaeaea', count: 5},
              textPosition: 'in',
              textStyle: {color: '#999'},
              minValue: 0,
              format: 'percent'
            },
            height: 210,
            explorer: {},
            colors: ['#FFA647'],
            areaOpacity: 0.4
          }
        };

        //average = sum / data.length;

        break; // Google BounceRate
      case 11:
        header = [['Date', 'Time (s)']];
        // Push data pairs in the Chart array

        // console.log(data);

        for (let i = 0; i < data.length; i++) {
          chartArray.push([parseDate(data[i][0]), parseInt(data[i][1], 10)]);
        }

        formattedData = {
          chartType: 'AreaChart',
          dataTable: header.concat(chartArray),
          chartClass: 11,
          options: {
            chartArea: {left: 0, right: 0, height: 190, top: 0},
            legend: {position: 'none'},
            curveType: 'function',
            hAxis: {gridlines: {color: '#eaeaea', count: -1}, textStyle: {color: '#666', fontName: 'Roboto'}, minTextSpacing: 15},
            vAxis: {gridlines: {color: '#eaeaea', count: 5}, textPosition: 'in', textStyle: {color: '#999'}, minValue: 0},
            height: 210,
            explorer: {},
            colors: ['#FFA647'],
            areaOpacity: 0.4
          }
        };
        break; // Google Average Session Duration
      case 12:
        header = [['Browser', 'Date', 'Sessions']];

        paddingRows = data.length % 10 ? 10 - (data.length % 10) : 0;

        for (let i = 0; i < data.length + paddingRows; i++) {
          if (i >= data.length) {
            chartArray.push(['', null, null]);
          } else {
            chartArray.push([ChartsCallsService.cutString(data[i][0], 30), parseDate(data[i][1]), parseInt(data[i][2], 10)]);
          }
        }
        formattedData = {
          chartType: 'Table',
          dataTable: header.concat(chartArray),
          chartClass: 12,
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

        formattedData = {
          chartType: 'AreaChart',
          dataTable: header.concat(chartArray),
          chartClass: 13,
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
        break; // Facebook Page Views
      case 14:
        header = [['City', 'Fans']];

        arr = Object.keys(data[data.length - 1].value).map(function (k) {
          return [ChartsCallsService.cutString(k, 30), data[data.length - 1].value[k]];
        });

        paddingRows = arr.length % 10 ? 10 - (arr.length % 10) : 0;

        for (let i = 0; i < paddingRows; i++) {
          arr.push(['', null]);
        }

        formattedData = {
          chartType: 'Table',
          dataTable: header.concat(arr),
          chartClass: 14,
          options: {
            alternatingRowStyle: true,
            sortAscending: false,
            sortColumn: 1,
            pageSize: 10,
            height: '100%',
            width: '100%'
          }
        };
        break; // Facebook Fan City
      case 15:
        header = [['City', 'Fans']];

        arr = Object.keys(data[data.length - 1].value).map(function (k) {
          return [ChartsCallsService.cutString(k, 30), data[data.length - 1].value[k]];
        });

        paddingRows = arr.length % 10 ? 10 - (arr.length % 10) : 0;

        for (let i = 0; i < paddingRows; i++) {
          arr.push(['', null]);
        }

        formattedData = {
          chartType: 'Table',
          dataTable: header.concat(arr),
          chartClass: 14,
          options: {
            alternatingRowStyle: true,
            sortAscending: false,
            sortColumn: 1,
            pageSize: 10,
            height: '100%',
            width: '100%'
          }
        };
        break; //IG Audience City
      case 16:
        header = [['Country', 'Popularity']];
        arr = Object.keys(data[data.length - 1].value).map(function (k) {
          return [k, data[data.length - 1].value[k]];
        });

        formattedData = {
          chartType: 'GeoChart',
          dataTable: header.concat(arr),
          chartClass: 2,
          options: {
            region: 'world',
            colors: ['#ff00a7'],
            colorAxis: {colors: ['#ff96db', '#ff00a7']},
            backgroundColor: '#fff',
            datalessRegionColor: '#eee',
            defaultColor: '#333',
            height: '300',
          }
        };
        break; //IG Audience Country
      case 17:
        header = [['Country', 'Male', 'Female']]; /// TODO: fix containsGeoData to use header != 'Country'
        let keys = Object.keys(data[0]['value']); // getting all the gender/age data

        // putting a unique entry in chartArray for every existent age range
        for (let i = 0; i < keys.length; i++) {
          let index = 0;
          if (!(chartArray.find(e => e[0] === (keys[i].substr(2, keys.length))))) {
            chartArray.push([keys[i].substr(2, keys.length), 0, 0]);
            index = (chartArray.length - 1);
          } else {
            index = chartArray.findIndex(e => e[0] === (keys[i].substr(2, keys.length)));
          }
          // and collecting data
          (keys[i].substr(0, 1) === 'M') ? chartArray[index][2] = parseInt(data[0]['value'][keys[i]], 10) : chartArray[index][1] = parseInt(data[0]['value'][keys[i]], 10);
        }


        formattedData = {
          chartType: 'ColumnChart',
          dataTable: header.concat(chartArray),
          chartClass: 9,
          options: {
            chartArea: {left: 0, right: 0, height: 290, top: 0},
            legend: {position: 'none'},
            height: 310,
            vAxis: {gridlines: {color: '#eaeaea', count: 5}, textPosition: 'in', textStyle: {color: '#999'}},
            colors: ['#388aff','#ff96db'],
            areaOpacity: 0.4,
          }
        };
        break; //IG Audience Gender/Age
      case 18:
        header = [['Country', 'Number']]; /// TODO: fix containsGeoData to use header != 'Country'
        keys = Object.keys(data[0]['value']); // getting all the gender/age data

        // putting a unique entry in chartArray for every existent age range
        for (let i = 0; i < keys.length; i++) {
            chartArray.push([keys[i], parseInt(data[0]['value'][keys[i]], 10) ]);
          }
        chartArray.sort(function(obj1, obj2) {
          // Ascending: first age less than the previous
          return -(obj1[1] - obj2[1]);
        });

        let other = [['Other', 0]];
        chartArray.slice(4, chartArray.length).forEach(el => {
            other[0][1] += el[1];
        });
        chartArray = chartArray.slice(0, 4);

        formattedData = {
          chartType: 'ColumnChart',
          dataTable: header.concat(chartArray.concat(other)),
          chartClass: 9,
          options: {
            chartArea: {left: 0, right: 0, height: 290, top: 0},
            legend: {position: 'none'},
            height: 310,
            vAxis: {gridlines: {color: '#eaeaea', count: 5}, textPosition: 'in', textStyle: {color: '#999'}},
            colors: ['#ff96db'],
            areaOpacity: 0.4,
          }
        };
        break; //IG Audience Locale
      case 19:
        break;
      case 23:
        header = [['Date', 'Impressions']];
        // Push data pairs in the Chart array

        // console.log(data);

        for (let i = 0; i < data.length; i++) {
          chartArray.push([new Date(data[i].end_time), data[i].value]);
        }

        console.log(JSON.parse(JSON.stringify(chartArray)));

        formattedData = {
          chartType: 'AreaChart',
          dataTable: header.concat(chartArray),
          chartClass: 5,
          options: {
            chartArea: {left: 0, right: 0, height: 190, top: 0},
            legend: {position: 'none'},
            height: 210,
            hAxis: {gridlines: {color: '#eaeaea', count: -1}, textStyle: {color: '#666', fontName: 'Roboto'}, minTextSpacing: 15},
            vAxis: {gridlines: {color: '#eaeaea', count: 5}, textPosition: 'in', textStyle: {color: '#999'}},
            colors: ['#ff96db'],
            areaOpacity: 0.4
          }
        };
      case 24:
        break;
      case 25:
        break;
      case 26:
        header = [['Date', 'Reach']];
        // Push data pairs in the Chart array

        // console.log(data);

        for (let i = 0; i < data.length; i++) {
          chartArray.push([new Date(data[i].end_time), data[i].value]);
        }

        console.log(JSON.parse(JSON.stringify(chartArray)));

        formattedData = {
          chartType: 'AreaChart',
          dataTable: header.concat(chartArray),
          chartClass: 5,
          options: {
            chartArea: {left: 0, right: 0, height: 190, top: 0},
            legend: {position: 'none'},
            height: 310,
            hAxis: {gridlines: {color: '#eaeaea', count: -1}, textStyle: {color: '#666', fontName: 'Roboto'}, minTextSpacing: 15},
            vAxis: {gridlines: {color: '#eaeaea', count: 5}, textPosition: 'in', textStyle: {color: '#999'}},
            colors: ['#ff96db'],
            areaOpacity: 0.4,
          }
        };
        break; //IG Reach
      case 27:
        break;
      case 28:
        break;

    }

    return formattedData;
  }

  containsGeoData(chart: DashboardCharts) {

    const dataTable = chart.chartData.dataTable;

    if (dataTable) {
      const metric = dataTable[0][0];

      return metric.includes('Country') || metric.includes('City');
    }

    return false;
  }
}
