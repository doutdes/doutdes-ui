import {Injectable} from '@angular/core';
import {FacebookService} from './facebook.service';
import {InstagramService} from './instagram.service';
import {Observable} from 'rxjs';
import {GoogleAnalyticsService} from './googleAnalytics.service';
import {parseDate} from 'ngx-bootstrap/chronos';
import {IntervalDate} from '../../features/dashboard/redux-filter/filter.model';
import {DashboardCharts} from '../_models/DashboardCharts';
import {k} from '@angular/core/src/render3';
import {subDays} from 'date-fns';

@Injectable()
export class ChartsCallsService {

  constructor(private facebookService: FacebookService, private googleAnalyticsService: GoogleAnalyticsService, private InstagramService: InstagramService) {
  }

  public static cutString(str, maxLength) {
    if (str) {
      return str.length > maxLength ? str.substr(0, 30) + '...' : str;
    }
    else {
      return '...';
    }
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

  public initFormatting(ID, data) {
    let header;
    let chartData = [];
    let keys = [];
    let indexFound;
    let other;
    let paddingRows = 0;
    let interval;
    let temp, index;

    switch (ID) {
      case 1:
        header = [['Date', 'Number of fans']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([new Date(data[i].end_time), data[i].value]);
        }
        break;  // FB Fan Count
      case 2:
        header = [['Country', 'Popularity']];

        chartData = Object.keys(data[data.length - 1].value).map(function (k) {
          return [k, data[data.length - 1].value[k]];
        });
        break;  // Geo Map
      case 3:
        header = [['Date', 'Impressions']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([new Date(data[i].end_time), data[i].value]);
        }
        break;  // Page Impressions
      case 4:
        header = [['Date', 'Impressions']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([parseDate(data[i][0]), parseInt(data[i][1], 10)]);
        }
        break;  // Google PageViews (impressions by day)
      case 5:
        header = [['Date', 'Sessions']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([parseDate(data[i][0]), parseInt(data[i][1], 10)]);
        }
        break;  // Google Sessions
      case 6:
        /** Data array is constructed as follows:
         * 0 - date
         * 1 - page
         * 2 - value
         **/
        header = [['Type', 'Number']];

        for (let i = 0; i < data.length; i++) {
          indexFound = keys.findIndex(el => el === data[i][1]);

          if(indexFound >= 0) {
            chartData[indexFound][1] += parseInt(data[i][2], 10);
          } else {
            keys.push(data[i][1]);
            chartData.push([data[i][1] === '(none)' ? 'unknown' : data[i][1], parseInt(data[i][2], 10)]);
          }
        }
        break;  // Google Sources Pie
      case 7:
        /** Data array is constructed as follows:
         * 0 - date
         * 1 - page
         * 2 - value
         **/
        header = [['Website', 'Views']];

        for (let i = 0; i < data.length; i++) {
          indexFound = keys.findIndex(el => el === data[i][1]);

          if(indexFound >= 0) {
            chartData[indexFound][1] += parseInt(data[i][2], 10);
          } else {
            keys.push(data[i][1]);
            chartData.push([ChartsCallsService.cutString(data[i][1], 30), parseInt(data[i][2], 10)]);
          }
        }

        paddingRows = chartData.length % 10 ? 10 - (chartData.length % 10) : 0;

        for (let i = 0; i < paddingRows; i++) {
          chartData.push(['', null]);
        }
        break;  // Google List Referral
      case 8:
        header = [['Country', 'Popularity']];

        // Push data pairs in the Chart array
        chartData = Object.keys(data[data.length - 1].value).map(function (k) {
          return [k, data[data.length - 1].value[k]];
        });

        break;  // Fan Country Pie
      case 9:
        /** Data array is constructed as follows:
         * 0 - date
         * 1 - page
         * 2 - value
         **/

        header = [['Type', 'Number']];

        for (let i = 0; i < data.length; i++) {
          indexFound = keys.findIndex(el => el === data[i][1]);

          if(indexFound >= 0) {
            chartData[indexFound][1] += parseInt(data[i][2], 10);
          } else {
            keys.push(data[i][1]);
            chartData.push([data[i][1] === '(none)' ? 'unknown' : data[i][1], parseInt(data[i][2], 10)]);
          }
        }
        break;  // Google Sources Column Chart
      case 10:
        header = [['Date', 'Bounce rate']];

        for (let i = 0; i < data.length; i++) {
          const value = parseInt(data[i][1], 10) / 100.;
          chartData.push([parseDate(data[i][0]), value]);
        }
        break; // Google Bounce Rate
      case 11:
        header = [['Date', 'Time (s)']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([parseDate(data[i][0]), parseInt(data[i][1], 10)]);
        }
        break; // Google Average Session Duration
      case 12:
        /** Data array is constructed as follows:
         * 0 - date
         * 1 - browser
         * 2 - value
         **/

        header = [['Browser', 'Sessions']];

        for (let i = 0; i < data.length; i++) {
          indexFound = keys.findIndex(el => el === data[i][1]);

          if(indexFound >= 0) {
            chartData[indexFound][1] += parseInt(data[i][2], 10);
          } else {
            keys.push(data[i][1]);
            chartData.push([ChartsCallsService.cutString(data[i][1], 30), parseInt(data[i][2], 10)]);
          }
        }
        break; // Google list Session per Browser
      case 13:
        header = [['Date', 'Views']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([new Date(data[i].end_time), data[i].value]);
        }
        break; // Facebook Page Views
      case 14:
        header = [['City', 'Fans']];

        chartData = Object.keys(data[data.length - 1].value).map(function (k) {
          return [ChartsCallsService.cutString(k, 30), data[data.length - 1].value[k]];
        });
        break; // Facebook Fan City
      case 15:
        header = [['City', 'Fans']];

        chartData = Object.keys(data[data.length - 1].value).map(function (k) {
          return [ChartsCallsService.cutString(k, 30), data[data.length - 1].value[k]];
        });

        paddingRows = chartData.length % 10 ? 10 - (chartData.length % 10) : 0;

        for (let i = 0; i < paddingRows; i++) {
          chartData.push(['', null]);
        }
        break; // IG Audience City
      case 16:
        header = [['Country', 'Popularity']];
        chartData = Object.keys(data[data.length - 1].value).map(function (k) {
          return [k, data[data.length - 1].value[k]];
        });
        break; // IG Audience Country
      case 17:
        header = [['Country', 'Male', 'Female']]; /// TODO: fix containsGeoData to use header != 'Country'
        keys = Object.keys(data[0]['value']); // getting all the gender/age data

        // putting a unique entry in chartArray for every existent age range
        for (let i = 0; i < keys.length; i++) {
          let index = 0;
          if (!(chartData.find(e => e[0] === (keys[i].substr(2, keys.length))))) {
            chartData.push([keys[i].substr(2, keys.length), 0, 0]);
            index = (chartData.length - 1);
          } else {
            index = chartData.findIndex(e => e[0] === (keys[i].substr(2, keys.length)));
          }
          // and collecting data
          (keys[i].substr(0, 1) === 'M') ? chartData[index][2] = parseInt(data[0]['value'][keys[i]], 10) : chartData[index][1] = parseInt(data[0]['value'][keys[i]], 10);
        }
        break; // IG Audience Gender/Age
      case 18:
        header = [['Country', 'Number']]; /// TODO: fix containsGeoData to use header != 'Country'
        keys = Object.keys(data[0]['value']); // getting all the gender/age data

        // putting a unique entry in chartArray for every existent age range
        for (let i = 0; i < keys.length; i++) {
          chartData.push([keys[i], parseInt(data[0]['value'][keys[i]], 10)]);
        }
        chartData.sort(function (obj1, obj2) {
          // Ascending: first age less than the previous
          return -(obj1[1] - obj2[1]);
        });

        other = [['Other', 0]];
        chartData.slice(4, chartData.length).forEach(el => {
          other[0][1] += el[1];
        });
        chartData = chartData.slice(0, 4).concat(other);

        break; // IG Audience Locale
      case 19:

        interval = 3; // Interval of hours to show
        header = [['OnlineFollowers', 'Min', 'Average', 'Max']];

        for(let i = 0; i < data.length; i++)
          keys.push(data[i]['value']);

        for (let i = 0 ; i < 24; i += interval) {
          // MIN | AVG | MAX
          chartData.push([i + ':00-' + (i + interval) + ':00', Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER]);
        }

        // putting a unique entry in chartData for every existent age range
        for (let day = 0; day < keys.length; day++) {
          for (let h_interval = 0; h_interval < Object.keys(keys[day]).length; h_interval += interval) {
            temp = 0;
            index = 0;
            for (let hour = h_interval; hour < (h_interval + interval); hour++) {
              temp += parseInt(keys[day][hour], 10);
              index = (hour + 1) / interval;
            }

            chartData[index - 1][2] += temp;

            if (temp < chartData[index - 1][1]) {
              chartData[index - 1][1] = temp;
            }

            if (temp > chartData[index - 1][3]) {
              chartData[index - 1][3] = temp;
            }
          }
        }
        for (let i = 0; i < JSON.parse(JSON.stringify(chartData)).length; i++) {
          chartData[i][2] /= 30;
        }

        break; // IG Online followers
      case 20:
        break; // IG Email contacts
      case 21:
        break; // IG Follower count
      case 22:
        break; // IG Get directions clicks
      case 23:
        header = [['Date', 'Impressions']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([new Date(data[i].end_time), data[i].value]);
        }
        break; // IG Impressions by day
      case 24:
        break; // IG Phone Calls clicks
      case 25:
        break; // IG Profile views
      case 26:
        header = [['Date', 'Reach']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([new Date(data[i].end_time), data[i].value]);
        }

        break; // IG Reach
      case 27:
        break; // IG Text Message Clicks
      case 28:
        break; // IG Website Clicks
    }

    return header.concat(chartData);
  }

  public formatChart(ID, data) {
    let formattedData;
    let type;

    data = this.initFormatting(ID, data);

    switch (ID) {
      case 1:
        formattedData = {
          chartType: 'AreaChart',
          dataTable: data,
          chartClass: 1,
          options: {
            chartArea: {left: 30, right: 0, height: 280, top: 0},
            legend: {position: 'none'},
            lineWidth: 2,
            pointSize: 0,
            pointShape: 'circle',
            vAxis: {
              gridlines: {color: '#eaeaea', count: 5},
              minorGridlines: {color: 'transparent'},
              minValue: 0,
              textPosition: 'in',
              textStyle: {color: '#999'}
            },
            curveType: 'function',
            height: 310,
            explorer: {},
            colors: ['#63c2de'],
            areaOpacity: 0.4
          }
        };

        break;  // Fb Fan Count
      case 2:

        formattedData = {
          chartType: 'GeoChart',
          dataTable: data,
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
        break;  // Geo Map
      case 3:

        formattedData = {
          chartType: 'AreaChart',
          dataTable: data,
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
        break;  // Page Impressions
      case 4:
        formattedData = {
          chartType: 'AreaChart',
          dataTable: data,
          chartClass: 5,
          options: {
            chartArea: {left: 0, right: 0, height: 190, top: 0},
            legend: {position: 'none'},
            lineWidth: data.length > 15 ? (data.length > 40 ? 2 : 3) : 4,
            height: 210,
            pointSize: data.length > 15 ? 0 : 7,
            pointShape: 'circle',
            hAxis: {gridlines: {color: 'transparent'}, textStyle: {color: '#666', fontName: 'Roboto'}, minTextSpacing: 15},
            vAxis: {
              gridlines: {color: '#eaeaea', count: 5},
              minorGridlines: {color: 'transparent'},
              minValue: 0,
              textPosition: 'in',
              textStyle: {color: '#999'}
            },
            colors: ['#FFA647'],
            areaOpacity: 0.1
          }
        };
        break;  // Google PageViews (impressions by day)
      case 5:

        formattedData = {
          chartType: 'AreaChart',
          dataTable: data,
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
        break;  // Google Sessions
      case 6:
        formattedData = {
          chartType: 'PieChart',
          dataTable: data,
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
        break;  // Google Sources Pie
      case 7:
        formattedData = {
          chartType: 'Table',
          dataTable: data,
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
        break;  // Google List Referral
      case 8:

        formattedData = {
          chartType: 'PieChart',
          dataTable: data,
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
        break;  // Fan Country Pie
      case 9:

        formattedData = {
          chartType: 'ColumnChart',
          dataTable: data,
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
        break;  // Google Sources Column Chart
      case 10:
        type = 'ga_bounce';

        formattedData = {
          chartType: 'AreaChart',
          dataTable: data,
          chartClass: 10,
          options: {
            chartArea: {left: 0, right: 0, height: 190, top: 0},
            legend: {position: 'none'},
            lineWidth: data.length > 15 ? (data.length > 40 ? 2 : 3) : 4,
            height: 210,
            pointSize: data.length > 15 ? 0 : 7,
            pointShape: 'circle',
            hAxis: {gridlines: {color: 'transparent'}, textStyle: {color: '#666', fontName: 'Roboto'}, minTextSpacing: 15},
            vAxis: {
              gridlines: {color: '#eaeaea', count: 5},
              minorGridlines: {color: 'transparent'},
              minValue: 0,
              textPosition: 'in',
              textStyle: {color: '#999'}
            },
            colors: ['#FFA647'],
            areaOpacity: 0.1
          }
        };

        //average = sum / data.length;

        break; // Google BounceRate
      case 11:
        formattedData = {
          chartType: 'AreaChart',
          dataTable: data,
          chartClass: 5,
          options: {
            chartArea: {left: 0, right: 0, height: 190, top: 0},
            legend: {position: 'none'},
            lineWidth: data.length > 15 ? (data.length > 40 ? 2 : 3) : 4,
            height: 210,
            pointSize: data.length > 15 ? 0 : 7,
            pointShape: 'circle',
            hAxis: {gridlines: {color: 'transparent'}, textStyle: {color: '#666', fontName: 'Roboto'}, minTextSpacing: 15},
            vAxis: {
              gridlines: {color: '#eaeaea', count: 5},
              minorGridlines: {color: 'transparent'},
              minValue: 0,
              textPosition: 'in',
              textStyle: {color: '#999'}
            },
            colors: ['#FFA647'],
            areaOpacity: 0.1
          }
        };
        break; // Google Average Session Duration
      case 12:

        formattedData = {
          chartType: 'Table',
          dataTable: data,
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

        formattedData = {
          chartType: 'AreaChart',
          dataTable: data,
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
        formattedData = {
          chartType: 'Table',
          dataTable: data,
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
        formattedData = {
          chartType: 'Table',
          dataTable: data,
          chartClass: 15,
          options: {
            alternatingRowStyle: true,
            sortAscending: false,
            sortColumn: 1,
            pageSize: 10,
            height: '100%',
            width: '100%'
          }
        };

        break; // IG Audience City
      case 16:
        formattedData = {
          chartType: 'GeoChart',
          dataTable: data,
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
        break; // IG Audience Country
      case 17:
        formattedData = {
          chartType: 'ColumnChart',
          dataTable: data,
          chartClass: 9,
          options: {
            chartArea: {left: 0, right: 0, height: 290, top: 0},
            legend: {position: 'none'},
            height: 310,
            vAxis: {gridlines: {color: '#eaeaea', count: 5}, textPosition: 'in', textStyle: {color: '#999'}},
            colors: ['#388aff', '#ff96db'],
            areaOpacity: 0.4,
          }
        };
        break; // IG Audience Gender/Age
      case 18:
        formattedData = {
          chartType: 'ColumnChart',
          dataTable: data,
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
        break; // IG Audience Locale
      case 19:
        formattedData = {
          chartType: 'ColumnChart',
          dataTable: data,
          chartClass: 9,
          options : {
            chartArea: {left: 0, right: 0, height: 290, top: 0},
            height: 310,
            vAxis: {gridlines: {color: '#eaeaea', count: 5}, textPosition: 'in', textStyle: {color: '#999'}},
            colors: ['#FFCDEE', '#FF88E1', '#F33DFF'],
            areaOpacity: 0.4,
            legend: { position: 'top', maxLines: 3 },
            bar: { groupWidth: '75%' },
            isStacked: true,
          }
        };
        break; // IG Online followers
      case 20:
        break; // IG Email contacts
      case 21:
        break; // IG Follower count
      case 22:
        break; // IG Get directions clicks
      case 23:
        formattedData = {
          chartType: 'AreaChart',
          dataTable: data,
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
        break; // IG Impressions by day
      case 24:
        break; // IG Phone Calls clicks
      case 25:
        break; // IG Profile views
      case 26:
        formattedData = {
          chartType: 'AreaChart',
          dataTable: data,
          chartClass: 5,
          options: {
            chartArea: {left: 0, right: 0, height: 190, top: 0, bottom: 0},
            legend: {position: 'none'},
            height: 310,
            hAxis: {gridlines: {color: '#eaeaea', count: -1}, textStyle: {color: '#666', fontName: 'Roboto'}, minTextSpacing: 15},
            vAxis: {gridlines: {color: '#eaeaea', count: 5}, textPosition: 'in', textStyle: {color: '#999'}},
            colors: ['#ff96db'],
            areaOpacity: 0.4,
          }
        };
        break; // IG Reach
      case 27:
        break; // IG Text Message Clicks
      case 28:
        break; // IG Website Clicks
    }

    return formattedData;
  }

}
