import {Injectable} from '@angular/core';
import {FacebookService} from './facebook.service';
import {InstagramService} from './instagram.service';
import {Observable} from 'rxjs';
import {GoogleAnalyticsService} from './googleAnalytics.service';
import {parseDate} from 'ngx-bootstrap/chronos';
import {IntervalDate} from '../../features/dashboard/redux-filter/filter.model';
import {D_TYPE} from '../_models/Dashboard';
import {GA_CHART} from '../_models/GoogleData';
import {FB_CHART} from '../_models/FacebookData';
import {IG_CHART} from '../_models/InstagramData';

@Injectable()
export class ChartsCallsService {

  constructor(
    private facebookService: FacebookService,
    private googleAnalyticsService: GoogleAnalyticsService,
    private instagramService: InstagramService) {
  }

  public static cutString(str, maxLength) {
    if (str) {
      return str.length > maxLength ? str.substr(0, 30) + '...' : str;
    }
    return '...';
  }

  public retrieveChartData(ID, pageID?, intervalDate?: IntervalDate): Observable<any> {

    if (Object.values(FB_CHART).includes(ID)) {
      return this.facebookService.getData(ID, pageID);
    }

    else if (Object.values(IG_CHART).includes(ID)) {
      return this.instagramService.getData(ID, pageID);
    }

    else if (Object.values(GA_CHART).includes(ID)) {
      return this.googleAnalyticsService.getData(ID, intervalDate);
    }

    else {
      throw new Error('chartCallService.retrieveChartData -> ID doesn\'t exist');
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

    // console.warn('ID: ' + ID + ' - ', data);

    switch (ID) {
      case FB_CHART.FANS_DAY:
        header = [['Date', 'Number of fans']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([new Date(data[i].end_time), data[i].value]);
        }
        break;  // FB Fan Count
      case FB_CHART.FANS_COUNTRY_GEOMAP:
        header = [['Country', 'Popularity']];

        if (data.length > 0) {
          chartData = Object.keys(data[data.length - 1].value).map(function (k) {
            return [k, data[data.length - 1].value[k]];
          });
        }
        break;  // Geo Map
      case FB_CHART.IMPRESSIONS:
        header = [['Date', 'Impressions']];
        for (let i = 0; i < data.length; i++) {
          chartData.push([new Date(data[i].end_time), data[i].value]);
        }
        break;  // Page Impressions
      case GA_CHART.IMPRESSIONS_DAY:
        header = [['Date', 'Impressions']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([parseDate(data[i][0]), parseInt(data[i][1], 10)]);
        }
        break;  // Google PageViews (impressions by day)
      case GA_CHART.SESSION_DAY:
        header = [['Date', 'Sessions']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([parseDate(data[i][0]), parseInt(data[i][1], 10)]);
        }
        break;  // Google Sessions
      case GA_CHART.SOURCES_PIE:
        /** Data array is constructed as follows:
         * 0 - date
         * 1 - page
         * 2 - value
         **/
        header = [['Type', 'Number']];

        for (let i = 0; i < data.length; i++) {
          indexFound = keys.findIndex(el => el === data[i][1]);

          if (indexFound >= 0) {
            chartData[indexFound][1] += parseInt(data[i][2], 10);
          } else {
            keys.push(data[i][1]);
            chartData.push([data[i][1] === '(none)' ? 'unknown' : data[i][1], parseInt(data[i][2], 10)]);
          }
        }
        break;  // Google Sources Pie
      case GA_CHART.MOST_VISITED_PAGES:
        /** Data array is constructed as follows:
         * 0 - date
         * 1 - page
         * 2 - value
         **/
        header = [['Website', 'Views']];

        for (let i = 0; i < data.length; i++) {
          indexFound = keys.findIndex(el => el === data[i][1]);

          if (indexFound >= 0) {
            chartData[indexFound][1] += parseInt(data[i][2], 10);
          } else {
            keys.push(data[i][1]);
            chartData.push([ChartsCallsService.cutString(data[i][1], 30), parseInt(data[i][2], 10)]);
          }
        }

        paddingRows = chartData.length % 11 ? 11 - (chartData.length % 11) : 0;

        for (let i = 0; i < paddingRows; i++) {
          chartData.push(['', null]);
        }
        break;  // Google List Referral
      case FB_CHART.FANS_COUNTRY_PIE:
        header = [['Country', 'Popularity']];

        // Push data pairs in the Chart array
        chartData = Object.keys(data[data.length - 1].value).map(function (k) {
          return [k, data[data.length - 1].value[k]];
        });

        break;  // Fan Country Pie
      case GA_CHART.SOURCES_COLUMNS:
        /** Data array is constructed as follows:
         * 0 - date
         * 1 - page
         * 2 - value
         **/

        header = [['Type', 'Number']];

        for (let i = 0; i < data.length; i++) {
          indexFound = keys.findIndex(el => el === data[i][1]);

          if (indexFound >= 0) {
            chartData[indexFound][1] += parseInt(data[i][2], 10);
          } else {
            keys.push(data[i][1]);
            chartData.push([data[i][1] === '(none)' ? 'unknown' : data[i][1], parseInt(data[i][2], 10)]);
          }
        }
        break;  // Google Sources Column Chart
      case GA_CHART.BOUNCE_RATE:
        header = [['Date', 'Bounce rate']];

        for (let i = 0; i < data.length; i++) {
          const value = parseInt(data[i][1], 10) / 100.;
          chartData.push([parseDate(data[i][0]), value]);
        }
        break; // Google Bounce Rate
      case GA_CHART.AVG_SESS_DURATION:
        header = [['Date', 'Time (s)']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([parseDate(data[i][0]), parseInt(data[i][1], 10)]);
        }
        break; // Google Average Session Duration
      case GA_CHART.BROWSER_SESSION:
        /** Data array is constructed as follows:
         * 0 - date
         * 1 - browser
         * 2 - value
         **/

        header = [['Browser', 'Sessions']];

        for (let i = 0; i < data.length; i++) {
          indexFound = keys.findIndex(el => el === data[i][1]);

          if (indexFound >= 0) {
            chartData[indexFound][1] += parseInt(data[i][2], 10);
          } else {
            keys.push(data[i][1]);
            chartData.push([ChartsCallsService.cutString(data[i][1], 30), parseInt(data[i][2], 10)]);
          }
        }
        paddingRows = chartData.length % 11 ? 11 - (chartData.length % 11) : 0;

        for (let i = 0; i < paddingRows; i++) {
          chartData.push(['', null]);
        }
        break; // Google list Session per Browser
      case FB_CHART.PAGE_VIEWS:
        header = [['Date', 'Views']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([new Date(data[i].end_time), data[i].value]);
        }
        break; // Facebook Page Views
      case FB_CHART.FANS_CITY:
        header = [['City', 'Fans']];

        chartData = Object.keys(data[data.length - 1].value).map(function (k) {
          return [ChartsCallsService.cutString(k, 30), data[data.length - 1].value[k]];
        });
        break; // Facebook Fan City
      case IG_CHART.AUD_CITY:
        header = [['City', 'Fans']];

        chartData = Object.keys(data[data.length - 1].value).map(function (k) {
          return [ChartsCallsService.cutString(k, 30), data[data.length - 1].value[k]];
        });

        paddingRows = chartData.length % 10 ? 10 - (chartData.length % 10) : 0;

        for (let i = 0; i < paddingRows; i++) {
          chartData.push(['', null]);
        }
        break; // IG Audience City
      case IG_CHART.AUD_COUNTRY:
        header = [['Country', 'Popularity']];
        chartData = Object.keys(data[data.length - 1].value).map(function (k) {
          return [k, data[data.length - 1].value[k]];
        });
        break; // IG Audience Country
      case IG_CHART.AUD_GENDER_AGE:
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
          (keys[i].substr(0, 1) === 'M') ? chartData[index][1] = parseInt(data[0]['value'][keys[i]], 10) : chartData[index][2] = parseInt(data[0]['value'][keys[i]], 10);
        }
        chartData = chartData.sort();
        break; // IG Audience Gender/Age
      case IG_CHART.AUD_LOCALE:
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
      case IG_CHART.ONLINE_FOLLOWERS:

        interval = 3; // Interval of hours to show
        header = [['OnlineFollowers', 'Min', 'Average', 'Max']];

        for (let i = 0; i < data.length; i++)
          keys.push(data[i]['value']);

        for (let i = 0; i < 24; i += interval) {
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
      case IG_CHART.IMPRESSIONS:
        header = [['Date', 'Impressions']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([new Date(data[i].end_time), data[i].value]);
        }
        break; // IG Impressions by day
      case IG_CHART.REACH:
        header = [['Date', 'Reach']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([new Date(data[i].end_time), data[i].value]);
        }
        break; // IG Reach
      case IG_CHART.COMPOSED_CLICKS:
        header = [['Type', 'Number']];
        let map = new Map();
        //group by click type
        for (let i = 0; i < data.length; i++) {
          map.has(data[i]['metric']) ? map.set(data[i]['metric'], parseInt(map.get(data[i]['metric']) + data[i]['value'], 10)) : map.set(data[i]['metric'], parseInt(data[i]['value'], 10));
          //map.has(data[i]['metric']) ? map.set(data[i]['metric'], parseInt(25, 10)) : map.set(data[i]['metric'], parseInt(25, 10));

        }
        //s(map);
        let empty = true;
        map.forEach((value: boolean, key: string) => {
          //console.log(map.get(key));
          if (parseInt(map.get(key), 10) != 0){
            empty = false;
          }
        });

        if(empty) {
          map = new Map();
          map.set('NO DATA', 100);//parseInt(100, 10));
          map.set('empty', true);

        }
        //console.log(map);
        map.forEach((value: boolean, key: string) => {
          chartData.push([key.replace(new RegExp('_', 'g'), ' '), map.get(key)]); //removing all the underscores
        });


        break; // IG composed clicks
    }

    return chartData.length > 0 ? header.concat(chartData) : [];
  }

  public formatChart(ID, data) {
    let formattedData;
    let type;

    data = this.initFormatting(ID, data);

    switch (ID) {
      case FB_CHART.FANS_DAY:
        formattedData = {
          chartType: 'AreaChart',
          dataTable: data,
          chartClass: 5,
          options: {
            chartArea: {left: 0, right: 0, height: 192, top: 0},
            legend: {position: 'none'},
            lineWidth: data.length > 15 ? (data.length > 40 ? 2 : 3) : 4,
            height: 210,
            pointSize: data.length > 15 ? 0 : 7,
            pointShape: 'circle',
            hAxis: {gridlines: {color: '#eaeaea'}, textStyle: {color: '#999', fontName: 'Roboto'}, minTextSpacing: 15},
            vAxis: {
              gridlines: {color: '#eaeaea', count: 5},
              minorGridlines: {color: 'transparent'},
              minValue: 0,
              textPosition: 'in',
              textStyle: {color: '#999'}
            },
            colors: ['#63c2de'],
            areaOpacity: 0.1
          }
        };

        break;  // Fb Fan Count
      case FB_CHART.FANS_COUNTRY_GEOMAP:
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
      case FB_CHART.IMPRESSIONS:
        formattedData = {
          chartType: 'AreaChart',
          dataTable: data,
          chartClass: 5,
          options: {
            chartArea: {left: 0, right: 0, height: 192, top: 0},
            legend: {position: 'none'},
            lineWidth: data.length > 15 ? (data.length > 40 ? 2 : 3) : 4,
            height: 210,
            pointSize: data.length > 15 ? 0 : 7,
            pointShape: 'circle',
            hAxis: {gridlines: {color: '#eaeaea'}, textStyle: {color: '#999', fontName: 'Roboto'}, minTextSpacing: 15},
            vAxis: {
              gridlines: {color: '#eaeaea', count: 5},
              minorGridlines: {color: 'transparent'},
              minValue: 0,
              textPosition: 'in',
              textStyle: {color: '#999'}
            },
            colors: ['#63c2de'],
            areaOpacity: 0.1
          }
        };

        break;  // Page Impressions
      case GA_CHART.IMPRESSIONS_DAY:
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
      case GA_CHART.SESSION_DAY:

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
        break;  // Google Sessions
      case GA_CHART.SOURCES_PIE:
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
      case GA_CHART.MOST_VISITED_PAGES:
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
            pageSize: 11,
            height: '100%',
            width: '100%'
          }
        };
        break;  // Google List Referral
      case FB_CHART.FANS_COUNTRY_PIE:

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
      case GA_CHART.SOURCES_COLUMNS:

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
      case GA_CHART.BOUNCE_RATE:
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
      case GA_CHART.AVG_SESS_DURATION:
        formattedData = {
          chartType: 'AreaChart',
          dataTable: data,
          chartClass: 5,
          options: {
            chartArea: {left: 0, right: 0, height: 192, top: 0},
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
      case GA_CHART.BROWSER_SESSION:

        formattedData = {
          chartType: 'Table',
          dataTable: data,
          chartClass: 12,
          options: {
            alternatingRowStyle: true,
            sortAscending: false,
            sortColumn: 1,
            pageSize: 11,
            height: '100%',
            width: '100%'
          }
        };
        break; // Google list sessions per browser
      case FB_CHART.PAGE_VIEWS:
        formattedData = {
          chartType: 'AreaChart',
          dataTable: data,
          chartClass: 5,
          options: {
            chartArea: {left: 0, right: 0, height: 192, top: 0},
            legend: {position: 'none'},
            lineWidth: data.length > 15 ? (data.length > 40 ? 2 : 3) : 4,
            height: 210,
            pointSize: data.length > 15 ? 0 : 7,
            pointShape: 'circle',
            hAxis: {gridlines: {color: '#eaeaea'}, textStyle: {color: '#999', fontName: 'Roboto'}, minTextSpacing: 15},
            vAxis: {
              gridlines: {color: '#eaeaea', count: 5},
              minorGridlines: {color: 'transparent'},
              minValue: 0,
              textPosition: 'in',
              textStyle: {color: '#999'}
            },
            colors: ['#63c2de'],
            areaOpacity: 0.1
          }
        };
        break; // Facebook Page Views
      case FB_CHART.FANS_CITY:
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
      case IG_CHART.AUD_CITY:
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
      case IG_CHART.AUD_COUNTRY:
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
      case IG_CHART.AUD_GENDER_AGE:
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
      case IG_CHART.AUD_LOCALE:
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
      case IG_CHART.ONLINE_FOLLOWERS:
        formattedData = {
          chartType: 'ColumnChart',
          dataTable: data,
          chartClass: 9,
          options: {
            chartArea: {left: 0, right: 0, height: 290, top: 0},
            height: 310,
            vAxis: {gridlines: {color: '#eaeaea', count: 5}, textPosition: 'in', textStyle: {color: '#999'}},
            colors: ['#FFCDEE', '#FF88E1', '#F33DFF'],
            areaOpacity: 0.4,
            legend: {position: 'top', maxLines: 3},
            bar: {groupWidth: '75%'},
            isStacked: true,
          }
        };
        break; // IG Online followers
      case IG_CHART.IMPRESSIONS:
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
      case IG_CHART.REACH:
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
      case IG_CHART.COMPOSED_CLICKS:
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
            pieSliceTextStyle: {fontSize: 11, color: '#222'},
            areaOpacity: 0.4
          }
        };
        if(data.filter(e => e[1]).length == 0){
          formattedData.colors = ['#BC16FF', '#FF5AF5', '#FF7DF9', '#FFABF7'];
          formattedData.dataTable = data;
        }
        else {
          formattedData.colors = ['#D3D3D3'];
          formattedData.dataTable = data.slice(0,2);
        }


        break; // IG clicks pie
    }

    return formattedData;
  }

  public retrieveMiniChartData(serviceID: number, pageID?, intervalDate?: IntervalDate) {
    let observables: Observable<any>[] = [];

    switch (serviceID) {
      case D_TYPE.FB:
        observables.push(this.facebookService.getData(FB_CHART.FANS_DAY, pageID));
        observables.push(this.facebookService.fbposts(pageID));
        observables.push(this.facebookService.fbpagereactions(pageID));
        observables.push(this.facebookService.getData(FB_CHART.IMPRESSIONS, pageID));
        break;
      case D_TYPE.GA:
        observables.push(this.googleAnalyticsService.gaUsers(intervalDate));
        observables.push(this.googleAnalyticsService.getData(GA_CHART.SESSION_DAY, intervalDate));
        observables.push(this.googleAnalyticsService.getData(GA_CHART.BOUNCE_RATE, intervalDate));
        observables.push(this.googleAnalyticsService.getData(GA_CHART.AVG_SESS_DURATION, intervalDate));
        break;
      case D_TYPE.IG:
        observables.push(this.instagramService.getBusinessInfo(pageID));
        observables.push(this.instagramService.getMedia(pageID));
        observables.push(this.instagramService.getData(IG_CHART.PROFILE_VIEWS, pageID));
        observables.push(this.instagramService.getData(IG_CHART.IMPRESSIONS, pageID));
        break;
      case D_TYPE.YT:
        break;
      default:
        throw new Error('retrieveMiniChartData -> Service ID ' + serviceID + ' not found');
    }

    return observables;
  }

  public formatMiniChartData(data: Array<any>, d_type: number, measure: string, intervalDate?: IntervalDate) {
    let result;

    switch (d_type) {
      case D_TYPE.GA:
        result = this.getGoogleMiniValue(measure, data);
        break;
      case D_TYPE.FB:
        result = this.getFacebookMiniValue(measure, data, intervalDate);
        break;
      case D_TYPE.IG:
        result = this.getInstagramMiniValue(measure, data, intervalDate);
        break;
    }

    return result;
  }

  private getGoogleMiniValue(measure, data) {
    let date = new Date(null);
    let value, sum = 0, avg, perc, step;

    for (const i in data) {
      sum += parseInt(data[i][1]);
    }

    avg = (sum / data.length).toFixed(2);

    switch (measure) {
      case 'bounce-rate':
        value = avg;
        step = this.searchStep(value, measure);
        perc = value;
        break;

      case 'time':
        date.setSeconds(parseInt(avg)); // specify value for SECONDS here
        value = date.toISOString().substr(11, 8);
        step = this.searchStep(avg, measure);

        perc = parseInt(avg) / step * 100;

        date.setSeconds(step);
        step = date.toISOString().substr(11, 8);
        break;

      default:
        value = sum;
        step = this.searchStep(value);
        perc = value / step * 100;
        break;
    }

    return {value, perc, step};
  }

  private getFacebookMiniValue(measure, data, intervalDate) {
    let value, perc, sum = 0, avg, max, aux, step;

    switch (measure) {
      case 'post-sum':
        data['data'] = data['data'].filter(el => (new Date(el['created_time'])) >= intervalDate.first && (new Date(el['created_time'])) <= intervalDate.last);
        value = data['data'].length;

        break; // The value is the number of post of the previous month, the perc is calculated considering the last 100 posts
      case 'count':
        max = Math.max.apply(Math, data.map((o) => {
          return o.value;
        }));
        data = data.filter(el => (new Date(el.end_time)) >= intervalDate.first && (new Date(el.end_time)) <= intervalDate.last);
        value = data[data.length - 1].value;

        break; // The value is the last fan count, the perc is the value divided for the max fan count had in the last 2 years
      case 'reactions':
        data = data.filter(el => (new Date(el.end_time)) >= intervalDate.first && (new Date(el.end_time)) <= intervalDate.last);
        max = [];

        for (const i in data) {
          aux = 0;
          aux += data[i]['value']['like'] || 0;
          aux += data[i]['value']['love'] || 0;
          aux += data[i]['value']['haha'] || 0;
          aux += data[i]['value']['wow'] || 0;
          aux += data[i]['value']['sorry'] || 0;
          aux += data[i]['value']['anger'] || 0;

          sum += aux;
          max.push(aux);
        }

        avg = sum / data.length;
        value = sum;

        break; // The value is the sum of all the reactions of the previous month, the perc is calculated dividing the average reactions for the max value
      default:
        data = data.filter(el => (new Date(el.end_time)) >= intervalDate.first && (new Date(el.end_time)) <= intervalDate.last);
        value = data[data.length - 1].value;

        break; // default take the last value as the good one, the perc is calculated dividing the avg for the max value
    }

    step = this.searchStep(value);
    perc = value / step * 100;

    return {value, perc, step};
  }

  private getInstagramMiniValue(measure, data, intervalDate) {
    let value, perc, sum = 0, avg, max, aux, step;

    switch (measure) {
      case 'count':
        value = data['followers_count'];
        break; // The value is the last fan count, the perc is the value divided for the max fan count had in the last 2 years
      default:
        data = data.filter(el => (new Date(el.end_time)) >= intervalDate.first && (new Date(el.end_time)) <= intervalDate.last);
        for (const i in data) {
          sum += data[i].value;
        }

        // avg = sum / data.length;
        value = sum;

        break; // The value is the sum of all the reactions of the previous month, the perc is calculated dividing the average reactions for the max value
    }

    step = this.searchStep(value);
    perc = value / step * 100;

    return {value, perc, step};
  }

  private searchStep(value, measure?) {
    const nextStep = [10, 25, 50, 250, 1000, 5000, 10000, 50000, 100000];
    let step;
    let done = false;
    let i = 0;

    if (measure === 'bounce-rate') {
      step = (value - (value % 10)).toFixed(2) + '%';
      done = true;
    }

    if (measure === 'time') {
      step = (value - (value % 60)) + 60;
      done = true;
    }

    if (!done && value < nextStep[0]) {
      step = nextStep[0];
      done = true;
    }

    if (!done && value > nextStep[nextStep.length - 1]) {
      step = nextStep[nextStep.length - 1];
      done = true;
    }

    while (!done && value > nextStep[i]) {
      step = nextStep[i + 1];
      i++;
    }

    return step;
  }
}
