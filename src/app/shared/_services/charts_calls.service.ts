import {Injectable, Input} from '@angular/core';
import {FacebookService} from './facebook.service';
import {InstagramService} from './instagram.service';
import {Observable, of} from 'rxjs';
import {GoogleAnalyticsService} from './googleAnalytics.service';
import {YoutubeService} from './youtube.service';
import {parseDate} from 'ngx-bootstrap/chronos';
import {DashboardData, IntervalDate} from '../../features/dashboard/redux-filter/filter.model';
import {D_TYPE} from '../_models/Dashboard';
import {GA_CHART, GA_PALETTE} from '../_models/GoogleData';
import {FB_CHART, FB_PALETTE} from '../_models/FacebookData';
import {IG_CHART, IG_PALETTE} from '../_models/InstagramData';
import * as moment from 'moment';

import {subDays} from 'date-fns';

import {YT_CHART, YT_PALETTE} from '../_models/YoutubeData';
import {ChartParams} from '../_models/Chart';
import {GaChartParams, IgChartParams} from '../_models/MiniCard';
import {FacebookMarketingService} from './facebook-marketing.service';
import {FacebookCampaignsService} from './facebook-campaigns.service';
import {FBM_CHART} from '../_models/FacebookMarketingData';
import NumberFormat = Intl.NumberFormat;
import {computeStyle, copyObj} from '@angular/animations/browser/src/util';
import {parse} from 'ts-node';
import {FBC_CHART} from '../_models/FacebookCampaignsData';
import {GlobalEventsManagerService} from './global-event-manager.service';
import {TranslateService} from '@ngx-translate/core';
import {User} from '../_models/User';
import {UserService} from './user.service';
import {HttpClient} from '@angular/common/http';
import {forEach} from '@angular/router/src/utils/collection';
import {dayOfYearFromWeeks} from 'ngx-bootstrap/chronos/units/week-calendar-utils';
import {error} from 'util';
import {parseIntAutoRadix} from '@angular/common/src/i18n/format_number';
import {DashboardCharts} from '../_models/DashboardCharts';


@Injectable()
export class ChartsCallsService {

  user: User;
  listCountry = new Map();
  listCountryIng = new Map();
  listLanguageItalian = new Map();

  intervalDateComparison: any;

  constructor(
    private facebookService: FacebookService,
    private googleAnalyticsService: GoogleAnalyticsService,
    private instagramService: InstagramService,
    private youtubeService: YoutubeService,
    private facebookMarketingService: FacebookMarketingService,
    private GEservice: GlobalEventsManagerService,
    private userService: UserService,
    private http: HttpClient,
    private facebookCampaignsService: FacebookCampaignsService) {
    this.userService.get().subscribe(data => {
      this.user = data;
      if (this.user.lang === 'it') {

        this.http.get('./assets/langSetting/languageTranslate/languageItalian.json').subscribe(file => {
          if (file) {
            this.listLanguageItalian = new Map;
            for (const i in file) {
              this.listLanguageItalian.set(file[i]['state'], file[i]['lan']);
            }
          }
        });
        this.http.get('./assets/langSetting/CountryTranslate/it/world.json').subscribe(file => {
            if (file) {
              this.listCountry = new Map;
              // tslint:disable-next-line:forin
              for (const i in file) {
                this.listCountry.set(file[i]['alpha2'].toUpperCase(), file[i]['name']);
              }
            }
          }
        );
        this.http.get('./assets/langSetting/CountryTranslate/en/world.json').subscribe(file => {
            if (file) {
              this.listCountryIng = new Map;
              // tslint:disable-next-line:forin
              for (const i in file) {
                this.listCountryIng.set(file[i]['alpha2'].toUpperCase(), file[i]['name']);
              }
            }
          }
        );

      } else {
        this.http.get('./assets/langSetting/CountryTranslate/en/world.json').subscribe(file => {
            if (file) {
              this.listCountry = new Map;
              // tslint:disable-next-line:forin
              for (const i in file) {
                this.listCountry.set(file[i]['alpha2'].toUpperCase(), file[i]['name']);
              }
            }
          }
        );
      }
    }, err => {
      console.error(err);
    });

  }

  public static cutString(str, maxLength) {
    if (str) {
      return str.length > maxLength ? str.substr(0, maxLength) + '...' : str;
    }
    return '...';
  }

  public retrieveChartData(type: number, params: ChartParams, pageID?: any): Observable<any> { // TODO change with params instead of ID

    switch (type) {
      case D_TYPE.FB:
        return this.facebookService.getData(params.metric, pageID);
      case D_TYPE.GA:
        return this.googleAnalyticsService.getData(params);
      case D_TYPE.IG:
        return this.instagramService.getData(params, pageID);
      case D_TYPE.YT:
        return this.youtubeService.getData(params.metric, pageID);
      case D_TYPE.FBM:
        return this.facebookMarketingService.getData(params, pageID);
      case D_TYPE.FBC:
        return this.facebookCampaignsService.getData(params, pageID); // idCampaign for retrieve data of a certain campaign
      default:
        throw new Error(`chartCallService.retrieveChartData -> chart type n.${type} does not exist!`);
    }
  }

  public initFormatting(ID, data) {
    let header;
    let chartData = [];
    let tmpData = [];
    let keys = [];
    let indexFound;
    let other;
    let paddingRows = 0;
    let interval;
    let temp, index;
    let myMap;
    let limit;
    const countryList = require('country-list');
    let flag = true;

    const female = [];
    const male = [];
    const supportArray = [];
    const age = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
    const time = ['0-3', '3-6', '6-9', '9-12', '12-15', '15-18', '18-21', '21-24']; // temporal range for some fbm charts
    let elem = 'Like ';
    const names = [' Immagini', ' Video', ' Caroselli'];
    let images, video, album;
    const colors = ['#fc7ed2', '#bf5dca', '#8c7cd0']; // temporaneo


    const min = [];
    const average = [];
    const max = [] ;
    const blockTime = [3, 6, 9, 12, 15, 18, 21, 24];

    const tmpF = [];
    const tmpF_age = ['F13-17', 'F18-24', 'F25-34', 'F35-44', 'F45-54', 'F55-64', 'F65+'];
    const tmpM = [];
    const tmpM_age = ['M13-17', 'M18-24', 'M25-34', 'M35-44', 'M45-54', 'M55-64', 'M65+'];
    const tmpU = [];
    const tmpU_age = ['U13-17', 'U18-24', 'U25-34', 'U35-44', 'U45-54', 'U55-64', 'U65+'];

    let now = new Date();
    let reach = 0, impression = 0;

    let j = 0;
    let k = 0;
    let acc = 0;
    let n = 0;

    let params: ChartParams = {};

    //controllo se la prima riga non sia un un valore anomalo
    if (data[0].value === undefined) {
      data[0].value = '';
    }

    switch (ID) {
      case FB_CHART.FANS_DAY:
        header = [['Data', 'Numero fan']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([moment(data[i].end_time).toDate(), data[i].value]);
        }

        break;  // FB Fan Count
      case FB_CHART.FANS_COUNTRY_GEOMAP:
        header = [['Paese', 'Numero fan']];

        if (data.length > 0) {
          chartData = Object.keys(data[data.length - 1].value).map(function (k) {
            return [k, data[data.length - 1].value[k]];
          });
        }

        chartData = this.addPaddingRows(chartData);

        break;  // Geo Map
      case FB_CHART.IMPRESSIONS:
        header = [['Data', 'Visualizzazioni']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([moment(data[i].end_time).toDate(), data[i].value]);
        }


        break;  // Page Impressions
      case FB_CHART.FANS_COUNTRY_PIE:
        header = [['Paese', 'Numero fan']];

        // Push data pairs in the Chart array
        chartData = Object.keys(data[data.length - 1].value).map(function (k) {
          return [k, data[data.length - 1].value[k]];
        });

        break;  // Fan Country Pie
      case FB_CHART.PAGE_VIEWS:
        header = [['Data', 'Visualizzazioni']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([moment(data[i].end_time).toDate(), data[i].value]);
        }
        break; // Facebook Page Views
      case FB_CHART.FANS_CITY:
        header = [['Paese', 'Numero fan']];

        // chartData = Object.keys(data[data.length - 1].value).map(function (k) {
        //   return [ChartsCallsService.cutString(countryList.getName(k), 30), data[data.length - 1].value[k]];
        // });
        // chartData.sort(function (obj1, obj2) {
        //   return obj2[1] > obj1[1] ? 1 : ((obj1[1] > obj2[1]) ? -1 : 0);
        // });

        chartData = this.changeNameCountry(data); // next release

        const oldValue = chartData[data.length - 2] ? data[data.length - 2]['value'] : 0;
        for (const i in chartData) {
          // tslint:disable-next-line:no-shadowed-variable
          const diff = oldValue[chartData[i][0]] ?
            parseInt(chartData[i][1], 10) - parseInt(oldValue[chartData[i][0]], 10) :
            1;
          diff > 0 ?
            chartData[i] = [chartData[i][0], {v : +1, f: chartData[i][1].toString() }] :
            diff === 0 ?
              chartData[i] = [chartData[i][0], {v : 0 * chartData[i][1], f: chartData[i][1].toString() }] :
              chartData[i] = [chartData[i][0], {v : -1, f: chartData[i][1].toString() }];
        }

        chartData = this.addPaddingRows(chartData);
        break; // Facebook Fan City in realtà è per conuntry
      case FB_CHART.ENGAGED_USERS:
        header = [['Data', 'Interazioni']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([moment(data[i].end_time).toDate(), data[i].value]);
        }

        break; // Facebook Interazioni Totali
      case FB_CHART.PAGE_CONSUMPTION:
        header = [['Data', 'Click']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([moment(data[i].end_time).toDate(), data[i].value]);
        }

        break; // Facebook Click sui contenuti
      case FB_CHART.PAGE_PLACES_CHECKIN:
        header = [['Data', 'Condivisioni']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([moment(data[i].end_time).toDate(), data[i].value]);
        }

        break; // Facebook Condivisione del luogo
      case FB_CHART.NEGATIVE_FEEDBACK:
        header = [['Data', 'Feedback negativi']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([moment(data[i].end_time).toDate(), data[i].value]);
        }

        break; // Facebook Feedback negativi
      case FB_CHART.ONLINE_FANS:
        header = [['Data', 'Fans online']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([moment(data[i].end_time).toDate(), data[i].value]);
        }

        break; // Facebook Fan online giornalieri
      case FB_CHART.FANS_ADD:
        header = [['Data', 'Nuovi fan']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([moment(data[i].end_time).toDate(), data[i].value]);
        }

        break; // Facebook Nuovi fan
      case FB_CHART.FANS_REMOVES:
        header = [['Data', 'Fans persi']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([moment(data[i].end_time).toDate(), data[i].value]);
        }
        break; // Facebook Fans cancellati
      case FB_CHART.IMPRESSIONS_PAID:
        header = [['Data', 'Visualizzazioni inserzioni']];

       for (let i = 0; i < data.length; i++) {
          chartData.push([moment(data[i].end_time).toDate(), data[i].value]);
        }

        break; // Facebbok Visualizzazioni di inserzioni
      case FB_CHART.VIDEO_VIEWS:
        header = [['Data', 'Riproduzioni di video']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([moment(data[i].end_time).toDate(), data[i].value]);
        }

        break; // Facebook Riproduzioni di video
      case FB_CHART.POST_IMPRESSIONS:
        header = [['Data', 'Post visualizzati']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([moment(data[i].end_time).toDate(), data[i].value]);
        }

        break; // Facebook Post visualizzati
      // case FB_CHART.VIDEO_ADS:
      //   header = [['Data', 'Annunci pub. visti']];
      //
      //   for (let i = 0; i < data.length; i++) {
      //     chartData.push([moment(data[i].end_time).toDate(), data[i].value]);
      //   }
      //
      //   break; // Facebook Annunci pub. visualizzati
      case FB_CHART.REACTIONS:
        header = [['Reazione', 'numero reaz.']];
        myMap = new Map();
        for (const el of data) {
          if (el['value']) {
            const reacts = el['value'];
            for (const i in reacts) {
              const value = parseInt(reacts[i], 10);
              if (myMap.has(i)) {
                myMap.set(i, myMap.get(i) + value);
              } else {
                myMap.set(i, value);
              }
            }
          }
        }

        const keyReactions = myMap.keys();
        const valuesReactions = myMap.values();

        for (let i = 0; i < myMap.size; i++) {
          chartData.push([keyReactions.next().value, valuesReactions.next().value]);
        }


        break; // Facebook Reazioni torta
      case FB_CHART.REACTIONS_LINEA:
        header = [['Data', 'Reazioni']];


        if (this.lengthKeys(data) != 0) {
          let sum = 0;
          for (const el of data) {
            if (el.value && (el.value != undefined)) {

              sum = Object.values(el.value).reduce((a: Number, b: Number) => {
                // @ts-ignore
                return a + b;
              }, 0);

              chartData.push([moment(el.end_time).toDate(), sum]);
            } else {
              chartData.push([moment(el.end_time).toDate(), 0]);
            }
          }
        } else {
          for (let i = 0; i < data.length; i++) {
            chartData.push([moment(data[i].end_time).toDate(), data[i].value || 0]);
          }
        }

        break; // Facebook Reazioni linea
      case FB_CHART.REACTIONS_COLUMN_CHART:
        header = [['Reazione', 'Numero']];
        const react = ['like', 'love', 'ahah', 'wow', 'anger', 'sorry'];
        myMap = new Map();
        for (const el of data) {
          if (el['value']) {
            const reacts = el['value'];
            // tslint:disable-next-line:forin
            for (let i in reacts) {
              const value = parseInt(reacts[i], 10);
              if (i === 'haha') {
                i = 'ahah';
              }
              if (myMap.has(i)) {
                myMap.set(i, myMap.get(i) + value);
              } else {
                myMap.set(i, value);
              }
            }
          }
        }

        for (const i of react) {
          if (myMap.has(i)) {
            myMap.set(i, myMap.get(i));
          } else {
            myMap.set(i, 0);
          }
        }

        const key = myMap.keys();
        const values = myMap.values();

        for (let i = 0; i < myMap.size; i++) {
          chartData.push([key.next().value, values.next().value]);
        }

        break; // Facebook Reazioni colonna
      case FB_CHART.PAGE_VIEW_EXTERNALS:
        header = [['Sito Web', 'Numero']];

        chartData = this.mapChartData(data);

        chartData.sort(function (obj1, obj2) {
          return obj2[1] > obj1[1] ? 1 : ((obj1[1] > obj2[1]) ? -1 : 0);
        });

        chartData = this.addPaddingRows(chartData);

        break; // Facebook Domini dei referenti esterni (elenco)
      case FB_CHART.PAGE_VIEW_EXTERNALS_LINEA:
        header = [['Sito Web', 'Numero']];

        if (this.lengthKeys(data) != 0) {
          let sum = 0;
          for (const el of data) {
            if (el && (el.value != undefined)) {
              sum = Object.values(el.value).reduce((a: Number, b: Number) => {// @ts-ignore
                // @ts-ignore
                return a + b;
              }, 0);
              chartData.push([moment(el.end_time).toDate(), sum]);
            } else {
              chartData.push([moment(el.end_time).toDate(), 0]);
            }
          }
        } else {
          for (let i = 0; i < data.length; i++) {
            chartData.push([moment(data[i].end_time).toDate(), data[i].value || 0]);
          }
        }

        break; // Facebook Domini dei referenti esterni (linea)
      case FB_CHART.PAGE_IMPRESSIONS_CITY:
        header = [['Città', 'numero views']];

        chartData = this.mapChartData(data);
        chartData.sort(function (obj1, obj2) {
          return obj2[1] > obj1[1] ? 1 : ((obj1[1] > obj2[1]) ? -1 : 0);
        });
        chartData = this.addPaddingRows(chartData);
        break; // Facebook Vista contenuti per città (elenco)
      case FB_CHART.PAGE_IMPRESSIONS_CITY_GEO:
        header = [['Città', 'Numero fan']];

        if (data.length > 0) {
          chartData = Object.keys(data[data.length - 1].value).map(function (k) {
            return [k, data[data.length - 1].value[k]];
          });
        }

        chartData = chartData.sort(function (obj1, obj2) {
          return obj2[1] > obj1[1] ? 1 : ((obj1[1] > obj2[1]) ? -1 : 0);
        });

        chartData = chartData.slice(0, 15);

        break; // Facebook Vista contenuti per città (geomappa)
      case FB_CHART.PAGE_IMPRESSIONS_COUNTRY_ELENCO:
        header = [['Paese', 'numero views']];

        chartData = this.mapChartData(data);

        chartData.sort(function (obj1, obj2) {
          return obj2[1] > obj1[1] ? 1 : ((obj1[1] > obj2[1]) ? -1 : 0);
        });

        chartData = this.addPaddingRows(chartData);

        break; // Facebook Vista contenuti per Paese (elenco)
      case FB_CHART.PAGE_FANS_CITY_ELENCO:
        header = [['Città', 'Numero fan']];
        chartData = [ ];
        const tempCity = Object.keys(data[data.length - 1]['value']);
        if (data.length > 0) {
          for (const el of tempCity) {
            chartData.push([el, data[data.length - 1]['value'][el]]);
          }
        }
        chartData.sort(function (obj1, obj2) {
          return obj2[1] > obj1[1] ? 1 : ((obj1[1] > obj2[1]) ? -1 : 0);
        });

        chartData = this.addPaddingRows(chartData);
        break; // Facebook fan per città(elenco)
      case FB_CHART.PAGE_FANS_AGE_ELENCO:
        header = [['Età', 'Maschio', 'Femmina']];

        const gender_data_fb = data[0] ? Object.keys(data[0]['value']) : null;

        if (gender_data_fb && gender_data_fb.length > 0) {
          keys = Object.keys(data[0]['value']); // getting all the gender/age data

          const subIndex = (keys[0].indexOf('.') !== -1) ? 2 : 1;

          // putting a unique entry in chartArray for every existent age range
          for (let i = 0; i < keys.length; i++) {
            index = 0;
            if (!(chartData.find(e => e[0] === (keys[i].substr(subIndex, keys[i].length))))) {
              chartData.push([keys[i].substr(subIndex, keys[i].length), 0, 0]);
              index = (chartData.length - 1);
            } else {
              index = chartData.findIndex(e => e[0] === (keys[i].substr(subIndex, keys[i].length)));
            }
            // and collecting data

            if (keys[i].substr(0, 1) === 'M') {
              chartData[index][1] = parseInt(data[0]['value'][keys[i]], 10);
            } else {
              if (keys[i].substr(0, 1) === 'F') {
                chartData[index][2] = parseInt(data[0]['value'][keys[i]], 10);
              }
            }

          }
          chartData = chartData.sort();
        }
        break; // Facebook fan per Age (elenco)


      case FB_CHART.ONLINE_FANS_FOR_DAY:
        header = [['Orario', 'Fans online']];

        const time1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

        myMap = new Map();
        for (const el of data) {
          if (el['value']) {
            const times = el['value'];
            // tslint:disable-next-line:forin

            for (let i in times) {
              const value = parseInt(times[i], 10);
              if (myMap.has(i)) {
                myMap.set(i, myMap.get(i) + value);
              } else {
                myMap.set(i, value);
              }
            }
          }
        }

        for (const i of time1) {
          if (myMap.has(i)) {
            myMap.set(i, myMap.get(i));
          } else {
            myMap.set(i, 0);
          }
        }

        const keyTime = myMap.keys();
        const valuesTime = myMap.values();

        for (let i = 0; i < time1.length; i++) {
          chartData.push([keyTime.next().value, valuesTime.next().value]);
        }

        for (let i = 0; i < chartData.length; i++) {
          chartData[i][1] = chartData[i][1] / data.length;
        }

        break; //Facebook Fan Online per ora (colonne)

      case GA_CHART.IMPRESSIONS_DAY:
        header = [['Data', 'Visualizzazioni']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([parseDate(data[i][0]), parseInt(data[i][1], 10)]);
        }
        break;  // Google PageViews (impressions by day)
      case GA_CHART.SESSION_DAY:
        header = [['Data', 'Sessioni']];


        for (let i = 0; i < data.length; i++) {
          chartData.push([parseDate(data[i][0]), parseInt(data[i][1], 10)]);
        }


        break;  // Google Sessionsd
      case GA_CHART.SOURCES_PIE:
        /** Data array is constructed as follows:
         * 0 - date
         * 1 - page
         * 2 - value
         **/
        //console.log(data);
        header = [['Sorgente', 'Numero']];

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
        header = [['Pagina', 'Visite']];

        for (let i = 0; i < data.length; i++) {
          indexFound = keys.findIndex(el => el === data[i][1]);

          if (indexFound >= 0) {
            chartData[indexFound][1] += parseInt(data[i][2], 10);
          } else {
            keys.push(data[i][1]);
            chartData.push([ChartsCallsService.cutString(data[i][1], 30), parseInt(data[i][2], 10)]);
          }
        }

        chartData.sort(function (obj1, obj2) {
          return obj2[1] > obj1[1] ? 1 : ((obj1[1] > obj2[1]) ? -1 : 0);
        });
        chartData = this.addPaddingRows(chartData);
        break;  // Google List Referral
      case GA_CHART.SOURCES_COLUMNS:
        /** Data array is constructed as follows:
         * 0 - date
         * 1 - page
         * 2 - value
         **/

        header = [['Tipo', 'Numero']];

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
        header = [['Data', 'Durata (s)']];

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

        header = [['Browser', 'Sessioni']];

        for (let i = 0; i < data.length; i++) {
          indexFound = keys.findIndex(el => el === data[i][1]);

          if (indexFound >= 0) {
            chartData[indexFound][1] += parseInt(data[i][2], 10);
          } else {
            keys.push(data[i][1]);
            chartData.push([ChartsCallsService.cutString(data[i][1], 30), parseInt(data[i][2], 10)]);
          }
        }

        chartData.sort(function (obj1, obj2) {
          return obj2[1] > obj1[1] ? 1 : ((obj1[1] > obj2[1]) ? -1 : 0);
        });

        paddingRows = chartData.length % 9 ? 9 - (chartData.length % 9) : 0;

        for (let i = 0; i < paddingRows; i++) {
          chartData.push(['', null]);
        }
        break; // Google list Session per Browser
      case GA_CHART.NEW_USERS:
        header = [['Data', 'Nuovi utenti']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([parseDate(data[i][0]), parseInt(data[i][1], 10)]);
        }
        break; // GA New Users
      case GA_CHART.MOBILE_DEVICES:
        header = [['Dispositivo', 'Sessioni']];

        for (let i = 0; i < data.length; i++) {
          indexFound = keys.findIndex(el => el === data[i][1]);

          if (indexFound >= 0) {
            chartData[indexFound][1] += parseInt(data[i][2], 10);
          } else {
            keys.push(data[i][1]);
            chartData.push([ChartsCallsService.cutString(data[i][1], 30), parseInt(data[i][2], 10)]);
          }
        }

        chartData.sort(function (obj1, obj2) {
          return obj2[1] > obj1[1] ? 1 : ((obj1[1] > obj2[1]) ? -1 : 0);
        });

        paddingRows = chartData.length % 9 ? 9 - (chartData.length % 9) : 0;

        for (let i = 0; i < paddingRows; i++) {
          chartData.push(['', null]);
        }
        break; // GA List mobile devices per sessions
      case GA_CHART.PERCENT_NEW_SESSION:
        header = [['Utenti di ritorno', 'Nuovi utenti']];
        let avg = 0;
        for (let i = 0; i < data.length; i++) {
          avg += parseFloat(data[i][1]);
        }

        avg /= data.length;

        chartData.push(['Nuovi', avg]);
        chartData.push(['Di ritorno', 100 - avg]);
        break;  // Google New Users vs Return users
      case GA_CHART.PAGE_LOAD_TIME:
        header = [['Pagina', 'Tempo medio (s)']];
        const tmpArray = [];
        for (let i = 0; i < data.length; i++) {
          indexFound = keys.findIndex(el => el === data[i][1]);
          if (indexFound >= 0) {
            chartData[indexFound][1] += parseFloat(data[i][2]);
            (tmpArray[indexFound][1])++;
          } else {
            keys.push(data[i][1]);
            chartData.push([ChartsCallsService.cutString(data[i][1], 30), parseFloat(data[i][2])]);
            tmpArray.push([ChartsCallsService.cutString(data[i][1], 30), 1]);
          }
        }

        // Calculating average
        for (let i = 0; i < chartData.length; i++) {
          chartData[i][1] /= (tmpArray[i][1] * 1000);
        }

        break;
      case GA_CHART.AUD_COUNTRY_GO:
        /** Data array is constructed as follows:
         * 0 - data
         * 1 - country
         * 2 - value
         **/
        header = [['Country', 'Value']];
        let mapData = new Map();

        for (let i = 0; i < data.length; i++) {
          if(!mapData.has(data[i][1])){
            mapData.set(data[i][1], parseInt(data[i][2]));
          } else {
            const value_0 = parseInt(mapData.get(data[i][1]));
            const value_1 = parseInt(data[i][2]);

            mapData.delete(mapData.get(data[i][1]));
            mapData.set(data[i][1], value_0 + value_1);
          }
        }

        const chiave = mapData.keys();
        const valore = mapData.values();

        for (let i = 0; i < mapData.size; i++) {
          chartData.push([chiave.next().value, valore.next().value]);
        }

        break; // Google Audience Country
      case GA_CHART.AUD_REGION_GO:
        /** Data array is constructed as follows:
         * 0 - data
         * 1 - region
         * 2 - country
         * 3 - value
         **/

        header = [['Region', 'Value']];
        let mapD = new Map();

        for (let i = 0; i < data.length; i++) {
          if (data[i][2] == "Italy") {
            if (!mapD.has(data[i][1])) {
              mapD.set(data[i][1], parseInt(data[i][3]));
            } else {
              const value_0 = parseInt(mapD.get(data[i][1]));
              const value_1 = parseInt(data[i][3]);

              mapD.delete(mapD.get(data[i][1]));
              mapD.set(data[i][1], value_0 + value_1);
            }
          }
        }

        const c = mapD.keys();
        const valu = mapD.values();

        for (let i = 0; i < mapD.size; i++) {
          chartData.push([c.next().value, valu.next().value]);
        }

        break; // Google Audience Region
      case GA_CHART.SESSION_ELENCO_GO:
        /** Data array is constructed as follows:
         * 0 - date
         * 1 -
         * 2 - value
         **/

        header = [['Sorgente', 'Sessioni']];

        for (let i = 0; i < data.length; i++) {
          indexFound = keys.findIndex(el => el === data[i][1]);

          if (indexFound >= 0) {
            chartData[indexFound][1] += parseInt(data[i][2], 10);
          } else {
            keys.push(data[i][1]);
            chartData.push([ChartsCallsService.cutString(data[i][1], 30), parseInt(data[i][2], 10)]);
          }
        }

        chartData.sort(function (obj1, obj2) {
          return obj2[1] > obj1[1] ? 1 : ((obj1[1] > obj2[1]) ? -1 : 0);
        });

        paddingRows = chartData.length % 9 ? 9 - (chartData.length % 9) : 0;

        for (let i = 0; i < paddingRows; i++) {
          chartData.push(['', null]);
        }

        break; // Google Session elenco

      case GA_CHART.GENDER_AGE :

        header = [['Età', 'Donne', {role: 'style'}, {role: 'annotation'}, 'Uomini', {role: 'style'}, {role: 'annotation'}]];

        let tmpAcc = 0;

        age.forEach(a =>
          data.filter(d => d[1] === 'female' && d[2] === a).length !== 0
            ? (v = data.filter(d => d[1] === 'female' && d[2] === a),
              v.forEach(el => tmpAcc += parseInt(el[3], 10)),
              female.push(tmpAcc * -1),
              tmpAcc = 0)
            : female.push(0));

        age.forEach(a =>
          data.filter(d => d[1] === 'male' && d[2] === a).length !== 0
            ? (v = data.filter(d => d[1] === 'male' && d[2] === a),
              v.forEach(el => tmpAcc += parseInt(el[3], 10)),
              male.push(tmpAcc),
              tmpAcc = 0)
            : male.push(0));

        for (let i = 0; i < 6; i++) {
          chartData.push([
            age[i],
            parseFloat(female[i]), GA_PALETTE.ORANGE.C5, age[i],
            parseFloat(male[i]), GA_PALETTE.LIME.C5, ''
          ]);
        }

        break;
      case GA_CHART.USER_ONLINE:
        header = [['Data', 'Utenti online']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([
            moment(data[i][0]).toDate().toLocaleString('en-En', {month: 'short', day: 'numeric'}),
            parseInt(data[i][1], 10)
          ]);
        }
        break;

      case GA_CHART.ADS:
        break;

      case GA_CHART.USER_LAST_SESSION:
        /*header = [['Giorni ultima sessione', 'Utenti']];
        let rangeDay = {'0': 0, '7': 0, '14': 0, '21': 0, '30+': 0};

        // 0 7 14 21 30+
        for (let i = 0; i < data.length; i++) {
          if (data[i][0] === 0) {
            rangeDay['0'] += parseInt(data[i][1], 10);
          }
          if (0 < data[i][0] && data[i][0] <= 7) {
            rangeDay['7'] +=  parseInt(data[i][1], 10);
          }
          if (7 < data[i][0] && data[i][0] <= 14) {
            rangeDay['14'] +=  parseInt(data[i][1], 10);
          }
          if (14 < data[i][0] && data[i][0] <= 21) {
            rangeDay['21'] +=  parseInt(data[i][1], 10);
          }
          if (21 < data[i][0]) {
            rangeDay['30+'] +=  parseInt(data[i][1], 10);
          }
        }

        for (let el in rangeDay) {
          chartData.push([el, rangeDay[el]]);
        }
        console.log(chartData)*/
        break;

      // Instagram chart
      case IG_CHART.AUD_CITY:
        //console.log("ELENCO", data);
        header = [['Città', 'Popolarità']];
        if (data.length > 0) {
          chartData = Object.keys(data[data.length - 1].value).map(function (k) {
            return [ChartsCallsService.cutString(k, 30), data[data.length - 1].value[k]];
          });

          chartData.sort(function (obj1, obj2) {
            return obj2[1] > obj1[1] ? 1 : ((obj1[1] > obj2[1]) ? -1 : 0);
          });

          const oldValue = data[data.length - 2] ? data[data.length - 2]['value'] : 0;
          for (const i in chartData) {
            // tslint:disable-next-line:no-shadowed-variable
            const diff = oldValue[chartData[i][0]] ?
              parseInt(chartData[i][1], 10) - parseInt(oldValue[chartData[i][0]], 10) :
              1;
            diff > 0 ?
              chartData[i] = [chartData[i][0], {v : +1, f: chartData[i][1].toString() }] :
              diff === 0 ?
                chartData[i] = [chartData[i][0], {v : 0 * chartData[i][1], f: chartData[i][1].toString() }] :
                chartData[i] = [chartData[i][0], {v : -1, f: chartData[i][1].toString() }];
          }
          chartData = this.addPaddingRows(chartData);
        }
        break; // IG Follower City - Elenco
      case IG_CHART.AUD_COUNTRY:
        header = [['Paese', 'Popolarità']];
        if (data.length > 0) {
          chartData = this.changeNameCountry(data);
        }
        break; // IG Follower Country
      case IG_CHART.AUD_GENDER_AGE:
        header = [['Età', 'Maschio', 'Femmina']];

        const gender_data = data[0] ? Object.keys(data[0]['value']) : null;

        if (gender_data && gender_data.length > 0) {
          keys = Object.keys(data[0]['value']); // getting all the gender/age data

          const subIndex = (keys[0].indexOf('.') !== -1) ? 2 : 1;

          // putting a unique entry in chartArray for every existent age range
          for (let i = 0; i < keys.length; i++) {
            index = 0;
            if (!(chartData.find(e => e[0] === (keys[i].substr(subIndex, keys[i].length))))) {
              chartData.push([keys[i].substr(subIndex, keys[i].length), 0, 0]);
              index = (chartData.length - 1);
            } else {
              index = chartData.findIndex(e => e[0] === (keys[i].substr(subIndex, keys[i].length)));
            }
            // and collecting data

            if (keys[i].substr(0, 1) === 'M') {
              chartData[index][1] = parseInt(data[0]['value'][keys[i]], 10);
            } else {
              if (keys[i].substr(0, 1) === 'F') {
                chartData[index][2] = parseInt(data[0]['value'][keys[i]], 10);
              }
            }

          }
          chartData = chartData.sort();
        }
        break; // IG Follower Gender/Age
      case IG_CHART.AUD_LOCALE:
        header = [['Paese', 'Numero']]; /// TODO: fix containsGeoData to use header != 'Country'
        if (data.length > 0) {


          const locale = require('locale-string');
          keys = Object.keys(data[data.length - 1]['value']);

          // putting a unique entry in chartArray for every existent age range
          for (let i = 0; i < keys.length; i++) {
            if (this.user.lang === 'it') {
              // tslint:disable-next-line:no-shadowed-variable
              const tmp = this.listLanguageItalian.get((keys[i].slice(0, 2)));
              chartData.push([tmp, parseInt(data[data.length - 1]['value'][keys[i]], 10)]);
            } else {
              chartData.push([locale.parse(keys[i].replace('_', '-')).language, parseInt(data[data.length - 1]['value'][keys[i]], 10)]);
            }
          }

          chartData.sort(function (obj1, obj2) {
            // Ascending: first age less than the previous
            return -(obj1[1] - obj2[1]);
          });
          // chartData = this.changeNameCountry(data);
          for (let i = 0; i < chartData.length; i++) {
            const arr = chartData.filter(el2 => chartData[i][0] === el2[0]);
            if (arr.length > 1) {
              chartData = chartData.filter(el => chartData[i] !== el ? !(arr.includes(el)) : chartData[i]);
              arr.forEach(el => el !== chartData[i] ? chartData[i][1] += el[1] : null);
            }
          }

          other = [['Altro', 0]];
          chartData.slice(5, chartData.length).forEach(el => {
            other[0][1] += el[1];
          });
          chartData = chartData.slice(0, 5).concat(other);
        }

        break; // IG Audience Locale
      case IG_CHART.ONLINE_FOLLOWERS:

        let dayValue = [];
        let day = [];
        let times = [];
        let tmp = [];
        const minArray = [[], [], [], [], [], [], [], []];
        const averageArray = [[], [], [], [], [], [], [], []];
        const maxArray = [[], [], [], [], [], [], [], []];
        const blockTime = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20], [21, 22, 23]];
        const blockDay = [];
        interval = 3; // Interval of hours to show
        header = [['Follower online', 'Min', 'Media', 'Max']];
        dayValue = Object.values(data);

        for (const i in dayValue) {
          dayValue[i]['value'] ? day = Object.values(dayValue[i]['value']) : day = [0, 0, 0];
          for (const j in blockTime) {
            day.length > 3 ? times = [day[blockTime[j][0]], day[blockTime[j][1]], day[blockTime[j][2]]] : times = [0, 0, 0];
            tmp.push(times);
          }
          blockDay.push(tmp);
          tmp = [];
        }
        for (let i = 0; i < blockDay.length; i++) {
          for (const j in blockTime) {
            maxArray[j].push(blockDay[i][j].reduce((m, x) => m > x ? m : x));
            minArray[j].push(blockDay[i][j].reduce((m, x) => m < x ? m : x));
            averageArray[j].push((blockDay[i][j].reduce((a, b) => a + b)) / 3);

            if ( i === blockDay.length - 1 ) {
              max.push(maxArray[j].reduce((a, b) => a + b) / blockTime.length);
              min.push(minArray[j].reduce((a, b) => a + b) / blockTime.length);
              average.push(averageArray[j].reduce((a, b) => a + b) / blockTime.length);
            }
          }
        }
        for (const i in time ) { // MIN | AVG | MAX
          chartData.push([time[i], min[i], average[i], max[i]]);
        }

        break; // IG Online followers
      case IG_CHART.IMPRESSIONS:
        header = [['Data', 'Visualizzazioni']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([moment(data[i].end_time).toDate(), (data[i].value)]);
        }

        break; // IG Impressions by day
      case IG_CHART.REACH:
        header = [['Data', 'Utenti raggiunti']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([moment(data[i].end_time).toDate(), data[i].value]);
        }
        break; // IG Reach
      case IG_CHART.ACTION_PERFORMED:
        header = [['Tipo', 'Numero']];
        let map = new Map();
        // group by click type
        for (let i = 0; i < data.length; i++) {
          map.has(data[i]['metric']) ? map.set(data[i]['metric'], parseInt(map.get(data[i]['metric']) + data[i]['value'], 10)) : map.set(data[i]['metric'], parseInt(data[i]['value'], 10));
          // let fakeVal = 25;
          // map.has(data[i]['metric']) ? map.set(data[i]['metric'], parseInt(fakeVal, 10)) : map.set(data[i]['metric'], parseInt(fakeVal, 10));

        }
        let empty = true;
        map.forEach((value: boolean, key: string) => {
          if (parseInt(map.get(key), 10) != 0) {
            empty = false;
          }
        });

        if (empty) {
          map = new Map();
          map.set('Nessun dato', 100); // parseInt(100, 10));
          map.set('empty', true);

        }
        map.forEach((value: boolean, key: string) => {
          chartData.push([key.replace(new RegExp('_', 'g'), ' ').replace(new RegExp('clicks', 'g'), ' '), map.get(key)]); // removing all the underscores
        });
        break; // IG composed clicks
      case IG_CHART.FOLLOWER_COUNT:
        header = [['Data', 'Nuovi utenti']];
        for (let i = 0; i < data.length; i++) {
          chartData.push([moment(data[i].end_time).toDate(), data[i].value]);
        }
        break; // IG FollowerCount
      case IG_CHART.LOST_FOLLOWERS:
        header = [['Data', 'Follower persi', { role: 'style' }]];
        let diff = 0;
        if (data.length > 0 && data[0]['business'].length > 1) {

          const follower_day = data[1]['follower_count'];
          const business = data[0]['business'];

          let i = (business.length - 1);
          while (i >= 1) {

            diff = business[i].followers_count !== 0 && business[i - 1].followers_count !== 0 && follower_day[i - 1].value
              ? Math.abs((business[i].followers_count - follower_day[i - 1].value) - (business[i - 1].followers_count))
              : 0;

            chartData.push([
              moment(business[i].end_time).toDate(),
              diff,
              IG_PALETTE.AMARANTH.C5
            ]);
            i--;
            i = business[i - 1] === undefined || follower_day[i - 1] === undefined ? 0 : i;
          }
        } else {
          chartData.push([new Date(), diff, IG_PALETTE.AMARANTH.C5]);
        }
        break;
      case IG_CHART.INFO_CLICKS_COL:
        header = [['Informazione', 'Valore']];
        const metrics = ['Email', 'Informazioni sede', 'Telefono', 'Messaggi', 'Sito'];

        const arr_acc = [];
        let count = 0;
        if (data[0]) {
          for (let i = 0; i < 5; i++) {
            data[0]['data'][i].forEach(el => count += el.value);
            arr_acc[i] = count;
            count = 0;
          }

          for (let i = 0; i < 5; i++) {
            chartData.push([metrics[i], arr_acc[i]]);
          }
        }

        break;
      case IG_CHART.MEDIA_ENGAGEMENT_DATA:
        header = [['Data', 'Interazioni', {role: 'tooltip'}]];

        now = new Date(data[data.length - 1].end_time.slice(0, 10));

        for (const d = new Date(data[0].end_time.slice(0, 10)); d <= now; d.setDate(d.getDate() + 1)) {
          // @ts-ignore
          tmpData = data.filter(el => Date.parse(new Date(el.end_time).toString().slice(3, 15)) === Date.parse(d.toString().slice(3, 15)));
          tmpData.forEach(el => acc += el.engagement + el.saved);
          n = tmpData.length > 0 ? tmpData.length : 1;
          const avgValue = tmpData.length > 1 ? ', in media ' + (acc / n).toFixed(2) + ' ' + elem : '';
          const note = acc + ' interazioni di ' + tmpData.length + ' post' + avgValue + ', il ' + d.toString().slice(3, 15);
          chartData.push([
            d.toString().slice(3, 15),
            acc,
            note
          ]);
          acc = 0;
        }
        break;
      case IG_CHART.MEDIA_LIKE_DATA:
        header = [['Data', 'Like', {role: 'tooltip'}]];
        let arr = [], len;
        now = new Date(data[data.length - 1].end_time.slice(0, 10))
        for (const d = new Date(data[0].end_time.slice(0, 10)); d <= now; d.setDate(d.getDate() + 1)) {
          arr = data.filter(el => Date.parse(new Date(el.end_time).toString().slice(3, 15)) === Date.parse(d.toString().slice(3, 15)));
          arr.forEach(el => acc += el.like);
          len = arr.length > 0 ? arr.length : 1;
          const avgValue = arr.length > 1 ? ', in media ' + (acc / len).toFixed(2) + ' ' + elem : '';
          const note = acc + ' ' + elem + ' di ' + arr.length + ' post' + avgValue + ', il ' + d.toString().slice(3, 15);
          chartData.push([
            d.toString().slice(3, 15),
            acc,
            note
          ]);
          acc = 0;
        }
        break;
      case IG_CHART.MEDIA_ENGAGEMENT_TYPE:
        header = [['Tipo', 'Interazioni', {role: 'tooltip'}, { role: 'style' }]];

        images = data.filter(el => el.media_type === 'IMAGE');
        video = data.filter(el => el.media_type === 'VIDEO');
        album = data.filter(el => el.media_type === 'CAROUSEL_ALBUM');
        let like = 0, commenti = 0, saved = 0;
        tmpData.push(images, video, album);

        for (let i = 0; i < tmpData.length; i++) {
          tmpData[i].forEach(el => acc += el.engagement + el.saved);
          tmpData[i].forEach(el => saved += el.saved);
          tmpData[i].forEach(el => commenti += el.comments);
          tmpData[i].forEach(el => like += el.like);
          chartData.push([names[i], acc, acc + ' interazioni' + ' di cui ' + like + ' like, ' + commenti + ' commenti e ' + saved + ' salvati su ' + images.length + names[i], colors[i]]);
          acc = 0;
        }
        break;
      case IG_CHART.MEDIA_LIKE_TYPE:
        header = [['Tipo', 'Like', {role: 'tooltip'}, { role: 'style' }]];

        images = data.filter(el => el.media_type === 'IMAGE');
        video = data.filter(el => el.media_type === 'VIDEO');
        album = data.filter(el => el.media_type === 'CAROUSEL_ALBUM');

        tmpData.push(images, video, album);

        for (let i = 0; i < tmpData.length; i++) {
          tmpData[i].forEach(el => acc += el.like);
          chartData.push([names[i], acc, acc + ' ' + elem + ' su ' + images.length + names[i], colors[i]]);
          acc = 0;
        }

        break;

      case IG_CHART.REACH_IMPRESSION_DATA:
        header = [['Data', ' Visualizzazioni utenti unici', { role: 'style' }, 'Visualizzazioni utenti totali', { role: 'style' }]];
        let supArr = [];
        now = new Date(data[data.length - 1].end_time.slice(0, 10))

        for (const d = new Date(data[0].end_time.slice(0, 10)); d <= now; d.setDate(d.getDate() + 1)) {
          // @ts-ignore
          supArr = data.filter(el => Date.parse(new Date(el.end_time).toString().slice(3, 15)) === Date.parse(d.toString().slice(3, 15)));
          supArr.forEach(el => {
            reach += el.reach;
            impression += el.impressions;
          });
          chartData.push([
            d.toString().slice(3, 15),
            reach,
            IG_PALETTE.IG_COLORS.C6,
            impression,
            IG_PALETTE.IG_COLORS.C1
          ]);
          reach = 0;
          impression = 0;
        }

        break;
      case IG_CHART.REACH_IMPRESSION_TYPE:
        header = [['Tipo post', 'Visualizzazioni utenti unici', { role: 'style' }, 'Visualizzazioni utenti totali', { role: 'style' }]];

        images = data.filter(el => el.media_type === 'IMAGE');
        video = data.filter(el => el.media_type === 'VIDEO');
        album = data.filter(el => el.media_type === 'CAROUSEL_ALBUM');

        images.forEach(el => {
          reach += el.reach;
          impression += el.impressions;
        });
        chartData.push(['Immagini', reach, IG_PALETTE.IG_COLORS.C6, impression, IG_PALETTE.IG_COLORS.C1]);
        reach = 0; impression = 0;

        video.forEach(el => {
          reach += el.reach;
          impression += el.impressions;
        });
        chartData.push(['Video', reach, IG_PALETTE.IG_COLORS.C6, impression, IG_PALETTE.IG_COLORS.C1]);
        reach = 0; impression = 0;

        album.forEach(el => {
          reach += el.reach;
          impression += el.impressions;
        });
        chartData.push(['Album', reach, IG_PALETTE.IG_COLORS.C6, impression, IG_PALETTE.IG_COLORS.C1]);

        break;
      case IG_CHART.COMPARISON_COLONNA:
        header = [['Colonna', 'Intervallo 1', 'Intervallo 2']];

        this.GEservice.ComparisonIntervals.subscribe(intervalDateComparison => {
          // Sezione nel caso di modifica intervalli
          if (intervalDateComparison != null) {
            j = this.checkControlDate(1, intervalDateComparison, data, 0);
            k = this.checkControlDate(1, intervalDateComparison, data, 1);

            chartData = [];
            chartData.push([this.formatInterval(intervalDateComparison, 1, data), j, 0]);
            chartData.push([this.formatInterval(intervalDateComparison, 2, data), 0, k]);
          } else {
            // Sezione nel caso di non modifica intervalli/valore di default
            chartData.push(['null', 0, 0]);
          }
        }, error => {
          console.log(error);
          console.error(error);
        });

        break; // IG Follower Count Comparasion
      case IG_CHART.AUD_CITY_GEOMAPPA:
        header = [['Città', 'Numero fan']];
        //console.log("GEOMAPPA", data);
        if (data.length > 0) {
          chartData = Object.keys(data[data.length - 1].value).map(function (k) {
            return [k, data[data.length - 1].value[k]];
          });
        }
        //console.log(chartData);
        chartData = chartData.sort(function (obj1, obj2) {
          return obj2[1] > obj1[1] ? 1 : ((obj1[1] > obj2[1]) ? -1 : 0);
        });

        //chartData = chartData.slice(0, 15);
        break; // IG Follower City - Geomappa
      case IG_CHART.AUD_GENDER_AGE_TORTA:
        header = [['Genere', 'numero']];

        // Ciclo le età
        for(let j = 0; j < tmpF_age.length; j++) {
          if(parseInt(data[data.length-1].value[tmpF_age[j]])){
            tmpF[j] = parseInt(data[data.length-1].value[tmpF_age[j]]);
          } else {
            tmpF[j] = 0;
          }
          if(parseInt(data[data.length-1].value[tmpM_age[j]])){
            tmpM[j] = parseInt(data[data.length-1].value[tmpM_age[j]]);
          } else {
            tmpM[j] = 0;
          }
        }

        // Salvo in ChartData
        for(let i = 0; i < tmpF_age.length; i++){
          chartData.push([tmpF_age[i], tmpF[i]]);
          chartData.push([tmpM_age[i], tmpM[i]]);
        }

        break; // IG Follower Gender/Age - Torta
      case IG_CHART.AUD_COUNTRY_ELENCO:
        header = [['Paese', 'Popolarità']];
        chartData =  this.changeNameCountry(data);

        if (data.length > 0) {
          // chartData = Object.keys(data[data.length - 1].value).map(function (k) {
          //   return [ChartsCallsService.cutString(k, 30), data[data.length - 1].value[k]];
          // });
          chartData.sort(function (obj1, obj2) {
            return obj2[1] > obj1[1] ? 1 : ((obj1[1] > obj2[1]) ? -1 : 0);
          });
          const oldValue = data[data.length - 2] ? data[data.length - 2]['value'] : 0;
          for (const i in chartData) {
            // tslint:disable-next-line:no-shadowed-variable
            const diff = oldValue[chartData[i][0]] ?
              parseInt(chartData[i][1], 10) - parseInt(oldValue[chartData[i][0]], 10) :
              1;
            diff > 0 ?
              chartData[i] = [chartData[i][0], {v : +1, f: chartData[i][1].toString() }] :
              diff === 0 ?
                chartData[i] = [chartData[i][0], {v : 0 * chartData[i][1], f: chartData[i][1].toString() }] :
                chartData[i] = [chartData[i][0], {v : -1, f: chartData[i][1].toString() }];
          }
          chartData = this.addPaddingRows(chartData);
        }
        break; // IG Follower Country - Elenco

      case YT_CHART.VIEWS:
        header = [['Data', 'Visualizzazioni']];
        for (let i = 0; i < data.length; i++) {
          chartData.push([parseDate(data[i].date), parseInt(data[i].value, 10)]);
        }
        break;
      case YT_CHART.COMMENTS:
        header = [['Data', 'Commenti']];

        for (let i = 0; i < data.length; i++) {
          chartData.push([parseDate(data[i].date), parseInt(data[i].value, 10)]);
        }

        break;
      case YT_CHART.LIKES:
        header = [['Data', 'Mi Piace']];
        for (let i = 0; i < data.length; i++) {
          chartData.push([parseDate(data[i].date), parseInt(data[i].value, 10)]);

        }
        break; // YT Likes
      case YT_CHART.DISLIKES:
        header = [['Data', 'Non Mi Piace']];
        for (let i = 0; i < data.length; i++) {
          chartData.push([parseDate(data[i].date), parseInt(data[i].value, 10)]);
        }
        break;
      case YT_CHART.SHARES:
        header = [['Data', 'Condivisioni']];
        for (let i = 0; i < data.length; i++) {
          chartData.push([parseDate(data[i].date), parseInt(data[i].value, 10)]);
        }
        break;
      case YT_CHART.AVGVIEW:
        header = [['Data', 'Tempo medio di riproduzione']];
        for (let i = 0; i < data.length; i++) {
          chartData.push([parseDate(data[i].date), parseInt(data[i].value, 10)]);
        }
        break;
      case YT_CHART.ESTWATCH:
        header = [['Data', 'Riproduzione stimata']];
        for (let i = 0; i < data.length; i++) {
          chartData.push([parseDate(data[i].date), parseInt(data[i].value, 10)]);
        }
        break;

      case FBM_CHART.AGE_REACH:
        data = this.formatDataFbm(data, 'age');
        header = [['Età', 'Copertura']];

        age.forEach(a =>
          data.filter(d => d.age === a).length !== 0
            ? (v = data.filter(d => d.age === a), supportArray.push(v[0].reach))
            : supportArray.push(0));

        for (let i = 0; i < supportArray.length; i++) {
          chartData.push([(age[i]), parseFloat(supportArray[i])]);
        }
        break;
      case FBM_CHART.AGE_IMPRESSIONS:
        data = this.formatDataFbm(data, 'age');
        header = [['Età', 'Impression']];

        age.forEach(a =>
          data.filter(d => d.age === a).length !== 0
            ? (v = data.filter(d => d.age === a), supportArray.push(v[0].impressions))
            : supportArray.push(0));

        for (let i = 0; i < supportArray.length; i++) {
          chartData.push([(age[i]), parseFloat(supportArray[i])]);
        }
        break;
      case FBM_CHART.AGE_SPEND:
        data = this.formatDataFbm(data, 'age');
        header = [['Età', 'Costo']];

        age.forEach(a =>
          data.filter(d => d.age === a).length !== 0
            ? (v = data.filter(d => d.age === a), supportArray.push(v[0].spend))
            : supportArray.push(0));

        for (let i = 0; i < supportArray.length; i++) {
          chartData.push([(age[i]), parseFloat(supportArray[i])]);
        }
        break;
      case FBM_CHART.AGE_INLINE:
        data = this.formatDataFbm(data, 'age');
        header = [['Età', 'Click link']];

        age.forEach(a =>
          data.filter(d => d.age === a).length !== 0
            ? (v = data.filter(d => d.age === a), supportArray.push(v[0].inline_link_clicks))
            : supportArray.push(0));

        for (let i = 0; i < supportArray.length; i++) {
          chartData.push([(age[i]), parseFloat(supportArray[i])]);
        }
        break;
      case FBM_CHART.AGE_CLICKS:
        data = this.formatDataFbm(data, 'age');
        header = [['Età', 'Click']];

        age.forEach(a =>
          data.filter(d => d.age === a).length !== 0
            ? (v = data.filter(d => d.age === a), supportArray.push(v[0].clicks))
            : supportArray.push(0));

        for (let i = 0; i < supportArray.length; i++) {
          chartData.push([(age[i]), parseFloat(supportArray[i])]);
        }
        break;
      case FBM_CHART.AGE_CPC:
        data = this.formatDataFbm(data, 'age');
        header = [['Età', 'CPC']];

        age.forEach(a =>
          data.filter(d => d.age === a).length !== 0
            ? (v = data.filter(d => d.age === a), supportArray.push(v[0].cpc))
            : supportArray.push(0));

        for (let i = 0; i < supportArray.length; i++) {
          chartData.push([(age[i]), parseFloat(supportArray[i])]);
        }
        break;
      case FBM_CHART.AGE_CPP:
        data = this.formatDataFbm(data, 'age');
        header = [['Età', 'CPP']];

        age.forEach(a =>
          data.filter(d => d.age === a).length !== 0
            ? (v = data.filter(d => d.age === a), supportArray.push(v[0].cpp))
            : supportArray.push(0));

        for (let i = 0; i < supportArray.length; i++) {
          chartData.push([(age[i]), parseFloat(supportArray[i])]);
        }
        break;
      case FBM_CHART.AGE_CTR:
        data = this.formatDataFbm(data, 'age');
        header = [['Età', 'CTR']];

        age.forEach(a =>
          data.filter(d => d.age === a).length !== 0
            ? (v = data.filter(d => d.age === a), supportArray.push(v[0].ctr))
            : supportArray.push(0));

        for (let i = 0; i < supportArray.length; i++) {
          chartData.push([(age[i]), parseFloat(supportArray[i])]);
        }
        break;

      case FBM_CHART.GENDER_REACH:
        data = this.formatDataFbm(data, 'gender');

        header = [['Genere', 'Copertura']];
        for (let i = 0; i < 2; i++) {
          chartData.push([(data[i].gender), parseInt(data[i].reach, 10)]);
        }
        break;
      case FBM_CHART.GENDER_IMPRESSIONS:
        data = this.formatDataFbm(data, 'gender');

        header = [['Genere', 'Impression']];
        for (let i = 0; i < 2; i++) {
          chartData.push([(data[i].gender), parseInt(data[i].impressions, 10)]);
        }
        break;
      case FBM_CHART.GENDER_SPEND:
        data = this.formatDataFbm(data, 'gender');

        header = [['Genere', 'Costo']];
        for (let i = 0; i < 2; i++) {
          chartData.push([(data[i].gender), parseInt(data[i].spend, 10)]);
        }
        break;
      case FBM_CHART.GENDER_INLINE:
        data = this.formatDataFbm(data, 'gender');

        header = [['Genere', 'Click link']];
        for (let i = 0; i < 2; i++) {
          chartData.push([(data[i].gender), parseInt(data[i].inline_link_clicks, 10)]);
        }
        break;
      case FBM_CHART.GENDER_CLICKS:
        data = this.formatDataFbm(data, 'gender');

        header = [['Genere', 'Click']];

        for (let i = 0; i < 2; i++) {
          chartData.push([(data[i].gender), parseInt(data[i].clicks, 10)]);
        }
        break;
      case FBM_CHART.GENDER_CPC:
        data = this.formatDataFbm(data, 'gender');

        header = [['Genere', 'CPC']];
        for (let i = 0; i < 2; i++) {
          chartData.push([(data[i].gender), parseFloat(data[i].cpc)]);
        }
        break;
      case FBM_CHART.GENDER_CPP:
        data = this.formatDataFbm(data, 'gender');

        header = [['Genere', 'CPP']];
        for (let i = 0; i < 2; i++) {
          chartData.push([(data[i].gender), parseFloat(data[i].cpp)]);
        }
        break;
      case FBM_CHART.GENDER_CTR:
        data = this.formatDataFbm(data, 'gender');

        header = [['Genere', 'CTR']];
        for (let i = 0; i < 2; i++) {
          chartData.push([(data[i].gender), parseFloat(data[i].ctr)]);
        }
        break;

      case FBM_CHART.GENDER_AGE_REACH:
        data = this.formatDataFbm(data, 'gender', 'age');

        header = [['Età', 'Copertura-Donna', {role: 'style'}, {role: 'annotation'}, 'Copertura-Uomo', {role: 'style'}, {role: 'annotation'}]];

        age.forEach(a =>
          data.filter(d => d.gender === 'female' && d.age === a).length !== 0
            ? (v = data.filter(d => d.gender === 'female' && d.age === a),
              female.push(v[0]['reach'] * -1))
            : female.push(0));

        age.forEach(a =>
          data.filter(d => d.gender === 'male' && d.age === a).length !== 0
            ? (v = data.filter(d => d.gender === 'male' && d.age === a),
              male.push(v[0]['reach']))
            : male.push(0));

        for (let i = 0; i < 6; i++) {
          chartData.push([
            age[i],
            parseFloat(female[i]), '#FF19FF', age[i],
            parseFloat(male[i]), '#1940FF', ''
          ]);
        }
        break;
      case FBM_CHART.GENDER_AGE_IMPRESSIONS:
        data = this.formatDataFbm(data, 'gender', 'age');

        header = [['Età', 'Impression-Donna', {role: 'style'}, {role: 'annotation'}, 'Impression-Uomo', {role: 'style'}, {role: 'annotation'}]];

        age.forEach(a =>
          data.filter(d => d.gender === 'female' && d.age === a).length !== 0
            ? (v = data.filter(d => d.gender === 'female' && d.age === a),
              female.push(v[0]['impressions'] * -1))
            : female.push(0));

        age.forEach(a =>
          data.filter(d => d.gender === 'male' && d.age === a).length !== 0
            ? (v = data.filter(d => d.gender === 'male' && d.age === a),
              male.push(v[0]['impressions']))
            : male.push(0));

        for (let i = 0; i < 6; i++) {
          chartData.push([(age[i]), parseFloat(female[i]), '#FF19FF', age[i], parseFloat(male[i]), '#1940FF', '']);
        }
        break;
      case FBM_CHART.GENDER_AGE_SPEND:
        data = this.formatDataFbm(data, 'gender', 'age');

        header = [['Età', 'Costo-Donna', {role: 'style'}, {role: 'annotation'}, 'Costo-Uomo', {role: 'style'}, {role: 'annotation'}]];

        age.forEach(a =>
          data.filter(d => d.gender === 'female' && d.age === a).length !== 0
            ? (v = data.filter(d => d.gender === 'female' && d.age === a),
              female.push(v[0]['spend'] * -1))
            : female.push(0));

        age.forEach(a =>
          data.filter(d => d.gender === 'male' && d.age === a).length !== 0
            ? (v = data.filter(d => d.gender === 'male' && d.age === a),
              male.push(v[0]['spend']))
            : male.push(0));

        for (let i = 0; i < 6; i++) {
          chartData.push([(age[i]), parseFloat(female[i]), '#FF19FF', age[i], parseFloat(male[i]), '#1940FF', '']);
        }
        break;
      case FBM_CHART.GENDER_AGE_CLICKS:
        data = this.formatDataFbm(data, 'gender', 'age');

        header = [['Age', 'Click-Donna', {role: 'style'}, {role: 'annotation'}, 'Click-Uomo', {role: 'style'}, {role: 'annotation'}]];

        age.forEach(a =>
          data.filter(d => d.gender === 'female' && d.age === a).length !== 0
            ? (v = data.filter(d => d.gender === 'female' && d.age === a),
              female.push(v[0]['clicks'] * -1))
            : female.push(0));

        age.forEach(a =>
          data.filter(d => d.gender === 'male' && d.age === a).length !== 0
            ? (v = data.filter(d => d.gender === 'male' && d.age === a),
              male.push(v[0]['clicks']))
            : male.push(0));

        for (let i = 0; i < 6; i++) {
          chartData.push([(age[i]), parseFloat(female[i]), '#FF19FF', age[i], parseFloat(male[i]), '#1940FF', '']);
        }
        break;
      case FBM_CHART.GENDER_AGE_INLINE:
        data = this.formatDataFbm(data, 'gender', 'age');

        header = [['Età', 'Click link-Donna', {role: 'style'}, {role: 'annotation'}, 'Click link-Uomo', {role: 'style'}, {role: 'annotation'}]];

        age.forEach(a =>
          data.filter(d => d.gender === 'female' && d.age === a).length !== 0
            ? (v = data.filter(d => d.gender === 'female' && d.age === a),
              female.push(v[0]['inline_link_clicks'] * -1))
            : female.push(0));

        age.forEach(a =>
          data.filter(d => d.gender === 'male' && d.age === a).length !== 0
            ? (v = data.filter(d => d.gender === 'male' && d.age === a),
              male.push(v[0]['inline_link_clicks']))
            : male.push(0));

        for (let i = 0; i < 6; i++) {
          chartData.push([(age[i]), parseFloat(female[i]), '#FF19FF', age[i], parseFloat(male[i]), '#1940FF', '']);
        }
        break;
      case FBM_CHART.GENDER_AGE_CPC:
        let v;
        data = this.formatDataFbm(data, 'gender', 'age');
        header = [['Age', 'CPC-FEMALE', {role: 'style'}, {role: 'annotation'}, 'CPC-MALE', {role: 'style'}, {role: 'annotation'}]];

        age.forEach(a =>
          data.filter(d => d.gender === 'female' && d.age === a).length !== 0
            ? (v = data.filter(d => d.gender === 'female' && d.age === a),
              female.push(v[0]['cpc'] * -1))
            : female.push(0));

        age.forEach(a =>
          data.filter(d => d.gender === 'male' && d.age === a).length !== 0
            ? (v = data.filter(d => d.gender === 'male' && d.age === a),
              male.push(v[0]['cpc']))
            : male.push(0));

        for (let i = 0; i < 6; i++) {
          chartData.push([(age[i]), parseFloat(female[i]), '#FF19FF', age[i], parseFloat(male[i]), '#1940FF', '']);
        }
        break;
      case FBM_CHART.GENDER_AGE_CTR:
        data = this.formatDataFbm(data, 'gender', 'age');

        header = [['Age', 'CTR-FEMALE', {role: 'style'}, {role: 'annotation'}, 'CTR-MALE', {role: 'style'}, {role: 'annotation'}]];

        age.forEach(a =>
          data.filter(d => d.gender === 'female' && d.age === a).length !== 0
            ? (v = data.filter(d => d.gender === 'female' && d.age === a),
              female.push(v[0]['ctr'] * -1))
            : female.push(0));

        age.forEach(a =>
          data.filter(d => d.gender === 'male' && d.age === a).length !== 0
            ? (v = data.filter(d => d.gender === 'male' && d.age === a),
              male.push(v[0]['ctr']))
            : male.push(0));

        for (let i = 0; i < 6; i++) {
          chartData.push([(age[i]), parseFloat(female[i]), '#FF19FF', age[i], parseFloat(male[i]), '#1940FF', '']);
        }
        break;
      case FBM_CHART.GENDER_AGE_CPP:
        data = this.formatDataFbm(data, 'gender', 'age');

        header = [['Age', 'CPP-FEMALE', {role: 'style'}, {role: 'annotation'}, 'CPP-MALE', {role: 'style'}, {role: 'annotation'}]];

        age.forEach(a =>
          data.filter(d => d.gender === 'female' && d.age === a).length !== 0
            ? (v = data.filter(d => d.gender === 'female' && d.age === a),
              female.push(v[0]['cpp'] * -1))
            : female.push(0));

        age.forEach(a =>
          data.filter(d => d.gender === 'male' && d.age === a).length !== 0
            ? (v = data.filter(d => d.gender === 'male' && d.age === a),
              male.push(v[0]['cpp']))
            : male.push(0));

        for (let i = 0; i < 6; i++) {
          chartData.push([(age[i]), parseFloat(female[i]), '#FF19FF', age[i], parseFloat(male[i]), '#1940FF', '']);
        }
        break;

      case FBM_CHART.COUNTRYREGION_REACH:
        data = this.formatDataFbm(data, 'country', 'region');
        header = [['Paese-Regione', 'Copertura']];
        for (let i = 0; i < data.length; i++) {
          chartData.push([(data[i].country + '-' + data[i].region), parseInt(data[i].reach, 10)]);
        }
        break;
      case FBM_CHART.COUNTRYREGION_IMPRESSIONS:
        data = this.formatDataFbm(data, 'country', 'region');

        header = [['Paese-Regione', 'Impression']];
        for (let i = 0; i < data.length; i++) {
          chartData.push([(data[i].country + '-' + data[i].region), parseInt(data[i].impressions, 10)]);
        }
        break;
      case FBM_CHART.COUNTRYREGION_SPEND:
        data = this.formatDataFbm(data, 'country', 'region');

        header = [['Paese-Regione', 'Costo']];
        for (let i = 0; i < data.length; i++) {
          chartData.push([(data[i].country + '-' + data[i].region), parseInt(data[i].spend, 10)]);
        }
        break;
      case FBM_CHART.COUNTRYREGION_CPC:
        data = this.formatDataFbm(data, 'country', 'region');

        header = [['Paese-Regione', 'CPC']];
        for (let i = 0; i < data.length; i++) {
          chartData.push([(data[i].country + '-' + data[i].region), parseFloat(data[i].cpc)]);
        }
        break;
      case FBM_CHART.COUNTRYREGION_CTR:
        data = this.formatDataFbm(data, 'country', 'region');

        header = [['Paese-Regione', 'CTR']];
        for (let i = 0; i < data.length; i++) {
          chartData.push([(data[i].country + '-' + data[i].region), parseInt(data[i].ctr, 10)]);
        }
        break;
      case FBM_CHART.COUNTRYREGION_CPP:
        data = this.formatDataFbm(data, 'country', 'region');

        header = [['Paese-Regione', 'CPP']];
        for (let i = 0; i < data.length; i++) {
          chartData.push([(data[i].country + '-' + data[i].region), parseInt(data[i].cpp, 10)]);
        }
        break;
      case FBM_CHART.COUNTRYREGION_CLICKS:
        data = this.formatDataFbm(data, 'country', 'region');

        header = [['Paese-Regione', 'Click']];
        for (let i = 0; i < data.length; i++) {
          chartData.push([(data[i].country + '-' + data[i].region), parseInt(data[i].clicks, 10)]);
        }
        break;
      case FBM_CHART.COUNTRYREGION_INLINE:
        data = this.formatDataFbm(data, 'country', 'region');

        header = [['Paese-Regione', 'Click link']];
        for (let i = 0; i < data.length; i++) {
          chartData.push([(data[i].country + '-' + data[i].region), parseInt(data[i].inline_link_clicks, 10)]);
        }
        break;

      case FBM_CHART.HOURLYADVERTISER_IMPRESSIONS:
        data = this.formatDataFbm(data, 'hourly_stats_aggregated_by_advertiser_time_zone');

        header = [['Orario', 'Impression']];
        for (let i = 0; i < time.length; i++) {
          supportArray.push(parseInt(data[i].impressions, 10) + parseInt(data[i + 1].impressions, 10) + parseInt(data[i + 2].impressions, 10)); // fascia oraria con 3 elementi

          chartData.push([
            time[i],
            parseInt(supportArray[i], 10)]);
        }
        break;
      case FBM_CHART.HOURLYADVERTISER_SPEND:
        data = this.formatDataFbm(data, 'hourly_stats_aggregated_by_advertiser_time_zone');

        header = [['Orario', 'Spend']];
        for (let i = 0; i < time.length; i++) {
          supportArray.push(parseInt(data[i].spend, 10) + parseInt(data[i + 1].spend, 10) + parseInt(data[i + 2].spend, 10));

          chartData.push([
            time[i],
            parseInt(supportArray[i], 10)]);
        }
        break;
      case FBM_CHART.HOURLYADVERTISER_CPC:
        data = this.formatDataFbm(data, 'hourly_stats_aggregated_by_advertiser_time_zone');

        header = [['Orario', 'CPC']];
        for (let i = 0; i < time.length; i++) {
          supportArray.push(parseFloat(data[i].cpc) + parseFloat(data[i + 1].cpc) + parseFloat(data[i + 2].cpc));

          chartData.push([
            time[i],
            parseFloat(supportArray[i])]);
        }
        break;
      case FBM_CHART.HOURLYADVERTISER_CTR:
        data = this.formatDataFbm(data, 'hourly_stats_aggregated_by_advertiser_time_zone');

        header = [['Orario', 'CTR']];
        for (let i = 0; i < time.length; i++) {
          supportArray.push(parseFloat(data[i].ctr) + parseFloat(data[i + 1].ctr) + parseFloat(data[i + 2].ctr));

          chartData.push([
            time[i],
            parseFloat(supportArray[i])]);
        }
        break;
      case FBM_CHART.HOURLYADVERTISER_CLICKS:
        data = this.formatDataFbm(data, 'hourly_stats_aggregated_by_advertiser_time_zone');

        header = [['Orario', 'Click']];
        for (let i = 0; i < time.length; i++) {
          supportArray.push(parseInt(data[i].clicks, 10) + parseInt(data[i + 1].clicks, 10) + parseInt(data[i + 2].clicks, 10));

          chartData.push([
            time[i],
            parseInt(supportArray[i], 10)]);
        }
        break;
      case FBM_CHART.HOURLYADVERTISER_INLINE:
        data = this.formatDataFbm(data, 'hourly_stats_aggregated_by_advertiser_time_zone');

        header = [['Orario', 'Click link']];
        for (let i = 0; i < time.length; i++) {
          supportArray.push(parseInt(data[i].inline_link_clicks, 10) + parseInt(data[i + 1].inline_link_clicks, 10) + parseInt(data[i + 2].inline_link_clicks, 10));

          chartData.push([
            time[i],
            parseInt(supportArray[i], 10)]);
        }
        break;

      case FBM_CHART.HOURLYAUDIENCE_REACH:
        data = this.formatDataFbm(data, 'hourly_stats_aggregated_by_audience_time_zone');

        header = [['Orario', 'Copertura']];
        for (let i = 0; i < time.length; i++) {
          supportArray.push(parseInt(data[i].reach, 10) + parseInt(data[i + 1].reach, 10) + parseInt(data[i + 2].reach, 10));

          chartData.push([
            time[i],
            parseInt(supportArray[i], 10)]);
        }
        break;
      case FBM_CHART.HOURLYAUDIENCE_IMPRESSIONS:
        data = this.formatDataFbm(data, 'hourly_stats_aggregated_by_audience_time_zone');

        header = [['Orario', 'Impression']];
        for (let i = 0; i < time.length; i++) {
          supportArray.push(parseInt(data[i].impressions, 10) + parseInt(data[i + 1].impressions, 10) + parseInt(data[i + 2].impressions, 10));

          chartData.push([
            time[i],
            parseInt(supportArray[i], 10)]);
        }
        break;
      case FBM_CHART.HOURLYAUDIENCE_SPEND:
        data = this.formatDataFbm(data, 'hourly_stats_aggregated_by_audience_time_zone');

        header = [['Orario', 'Costo']];
        for (let i = 0; i < time.length; i++) {
          supportArray.push(parseInt(data[i].spend, 10) + parseInt(data[i + 1].spend, 10) + parseInt(data[i + 2].spend, 10));

          chartData.push([
            time[i],
            parseInt(supportArray[i], 10)]);
        }
        break;
      case FBM_CHART.HOURLYAUDIENCE_CPC:
        data = this.formatDataFbm(data, 'hourly_stats_aggregated_by_audience_time_zone');

        //let time = ['0-3', '3-6', '6-9', '9-12', '12-15', '15-18', '18-21', '21-24'];

        header = [['Orario', 'CPC']];
        for (let i = 0; i < time.length; i++) {
          supportArray.push(parseFloat(data[i].cpc) + parseFloat(data[i + 1].cpc) + parseFloat(data[i + 2].cpc));

          chartData.push([
            time[i],
            parseFloat(supportArray[i])]);
        }


        break;
      case FBM_CHART.HOURLYAUDIENCE_CTR:
        data = this.formatDataFbm(data, 'hourly_stats_aggregated_by_audience_time_zone');

        header = [['Orario', 'CTR']];
        for (let i = 0; i < time.length; i++) {
          supportArray.push(parseFloat(data[i].ctr) + parseFloat(data[i + 1].ctr) + parseFloat(data[i + 2].ctr));

          chartData.push([
            time[i],
            parseFloat(supportArray[i])]);
        }
        break;
      case FBM_CHART.HOURLYAUDIENCE_CPP:
        data = this.formatDataFbm(data, 'hourly_stats_aggregated_by_audience_time_zone');

        header = [['Orario', 'CPP']];
        for (let i = 0; i < time.length; i++) {
          supportArray.push(parseFloat(data[i].cpp) + parseFloat(data[i + 1].cpp) + parseFloat(data[i + 2].cpp));

          chartData.push([
            time[i],
            parseFloat(supportArray[i])]);
        }
        break;
      case FBM_CHART.HOURLYAUDIENCE_CLICKS:
        data = this.formatDataFbm(data, 'hourly_stats_aggregated_by_audience_time_zone');

        header = [['Orario', 'Click']];
        for (let i = 0; i < time.length; i++) {
          supportArray.push(parseInt(data[i].clicks, 10) + parseInt(data[i + 1].clicks, 10) + parseInt(data[i + 2].clicks, 10));

          chartData.push([
            time[i],
            parseInt(supportArray[i], 10)]);
        }
        break;
      case FBM_CHART.HOURLYAUDIENCE_INLINE:
        data = this.formatDataFbm(data, 'hourly_stats_aggregated_by_audience_time_zone');

        header = [['Orario', 'Click link']];
        for (let i = 0; i < time.length; i++) {
          supportArray.push(parseInt(data[i].inline_link_clicks, 10) + parseInt(data[i + 1].inline_link_clicks, 10) + parseInt(data[i + 2].inline_link_clicks, 10));

          chartData.push([
            time[i],
            parseInt(supportArray[i], 10)]);
        }
        break;
    }
    return chartData.length > 0 ? header.concat(chartData) : [];
  }

  public formatChart(ID, data) {
    let formattedData;
    let type;
    let val = 0, val2 = 0;

    if (data === undefined){
      return [];
    }

    data = data && data.length > 0 ? this.initFormatting(ID, data) : data;

    switch (ID) {
      case FB_CHART.FANS_DAY:
        formattedData = this.areaChart( data,
          {
            options : {vAxis : {minValue: this.getMinChartStep(D_TYPE.FB, data, 0.8)},
              colors: [FB_PALETTE.BLUE.C1]}
          }
        );
        break;  // Fb Fan Count
      case FB_CHART.FANS_COUNTRY_GEOMAP:
        formattedData = this.geoChart(data, { options : {
            region: 'world',
            colors: [FB_PALETTE.BLUE.C1]}} );
        break;  // Geo Map
      case FB_CHART.IMPRESSIONS:
        formattedData = this.areaChart( data,
          {
            options : {vAxis : {minValue: this.getMinChartStep(D_TYPE.FB, data, 0.8)},
              colors: [FB_PALETTE.TURQUOISE.C10]}
          }
        );

        break;  // Page Impressions
      case FB_CHART.PAGE_VIEWS:
        formattedData = this.areaChart( data,
          {
            options : {vAxis : {minValue: this.getMinChartStep(D_TYPE.FB, data, 0.8)},
              colors: [FB_PALETTE.BLUE.C7]}
          }
        );

        break; // Facebook Page Views
      case FB_CHART.FANS_CITY:
        formattedData = this.tableChart(data, {formatters: [{columns: [1], type: 'ArrowFormat', options: {pattern: '#.##'}}]} );
        break; // Facebook Fan City in realtà per paese
      case FB_CHART.FANS_COUNTRY_PIE:
        formattedData = this.pieChart(data,
          {options: {sliceVisibilityThreshold: 0.05,
              colors: [FB_PALETTE.BLUE.C3, FB_PALETTE.BLUE.C8, FB_PALETTE.BLUE.C6,
                FB_PALETTE.TURQUOISE.C12, '#1671ff', FB_PALETTE.TURQUOISE.C9,
                FB_PALETTE.STIFFKEY.C11, FB_PALETTE.STIFFKEY.C2, FB_PALETTE.STIFFKEY.C9, '#364600']}});
        break;  // Fan Country Pie
      case FB_CHART.ENGAGED_USERS:
        formattedData = this.areaChart( data,
          {
            options : {vAxis : {minValue: this.getMinChartStep(D_TYPE.FB, data, 0.8)},
              colors: [FB_PALETTE.BLUE.C4]}
          }
        );

        break;  // Fb Interazioni Totali
      case FB_CHART.PAGE_CONSUMPTION:
        formattedData = this.areaChart( data,
          {
            options : {vAxis : {minValue: this.getMinChartStep(D_TYPE.FB, data, 0.8)},
              colors: [FB_PALETTE.TURQUOISE.C4]}
          }
        );
        break; // Fb Click sui contenuti
      case FB_CHART.PAGE_PLACES_CHECKIN:
        formattedData = this.areaChart( data,
          {
            options : {vAxis : {minValue: this.getMinChartStep(D_TYPE.FB, data, 0.8)},
              colors: [FB_PALETTE.STIFFKEY.C4]}
          }
        );
        break; // Fb Condivisione del luogo
      case FB_CHART.NEGATIVE_FEEDBACK:
        formattedData = this.areaChart( data,
          {
            options : {vAxis : {minValue: this.getMinChartStep(D_TYPE.FB, data, 0.8),
                viewWindowMode: 'explicit', viewWindow: {min: 0, max: this.getMaxChartStep(data)}},
              colors: [FB_PALETTE.BLUE.C7]}
          }
        );

        break; // Fb Feedback negativi
      case FB_CHART.ONLINE_FANS:
        formattedData = this.areaChart( data,
          {
            options : {vAxis : {minValue: this.getMinChartStep(D_TYPE.FB, data, 0.8)},
              colors: [FB_PALETTE.TURQUOISE.C6]}
          }
        );
        break; // Fb Fan online giornalieri
      case FB_CHART.FANS_ADD:
        formattedData = this.areaChart( data,
          {
            options : {vAxis : {minValue: this.getMinChartStep(D_TYPE.FB, data, 0.8)},
              colors: [FB_PALETTE.STIFFKEY.C7]}
          }
        );

        break; // Fb Nuovi fan
      case FB_CHART.FANS_REMOVES:

        formattedData = this.areaChart( data,
          {
            options : {vAxis : {minValue: this.getMinChartStep(D_TYPE.FB, data, 0.8)},
              colors: [FB_PALETTE.BLUE.C10]}
          }
        );
        break; // Fb Fan cancellati
      case FB_CHART.IMPRESSIONS_PAID:
        formattedData = this.areaChart( data,
          {
            options : {vAxis : {minValue: this.getMinChartStep(D_TYPE.FB, data, 0.8)},
              colors: [FB_PALETTE.TURQUOISE.C10]}
          }
        );
        break;  // Fb Visualizzazioni di inserzioni
      case FB_CHART.VIDEO_VIEWS:
        formattedData = this.areaChart( data,
          {
            options : {vAxis : {minValue: this.getMinChartStep(D_TYPE.FB, data, 0.8)},
              colors: [FB_PALETTE.STIFFKEY.C10]}
          }
        );
        break; // Fb Riproduzioni di video
      case FB_CHART.POST_IMPRESSIONS:
        formattedData = this.areaChart( data,
          {
            options : {vAxis : {minValue: this.getMinChartStep(D_TYPE.FB, data, 0.8)},
              colors: [FB_PALETTE.BLUE.C8]}
          }
        );
        break; // Fb Post visualizzati
      // case FB_CHART.VIDEO_ADS:
      //   formattedData = {
      //     chartType: 'AreaChart',
      //     dataTable: data,
      //     chartClass: 5,
      //     options: {
      //       chartArea: {left: 0, right: 0, height: 192, top: 0},
      //       legend: {position: 'none'},
      //       lineWidth: data.length > 15 ? (data.length > 40 ? 2 : 3) : 4,
      //       height: 210,
      //       pointSize: data.length > 15 ? 0 : 7,
      //       pointShape: 'circle',
      //       hAxis: {gridLines: {color: 'transparent'}, textStyle: {color: '#999', fontName: 'Roboto'}, minTextSpacing: 15},
      //       vAxis: {
      //         gridLines: {color: '#eaeaea', count: 5},
      //         minorGridlines: {color: 'transparent'},
      //         minValue: this.getMinChartStep(D_TYPE.FB, data, 0.8),
      //         textPosition: 'in',
      //         textStyle: {color: '#999'}
      //       },
      //       colors: [FB_PALETTE.TURQUOISE.C8],
      //       areaOpacity: 0.1
      //     }
      //   };
      //   break; // Fb Annunci pub. visualizzati
      case FB_CHART.REACTIONS:
        formattedData = this.pieChart(data,
          {options: {
              colors: [FB_PALETTE.BLUE.C3, FB_PALETTE.BLUE.C8, FB_PALETTE.BLUE.C6,
                FB_PALETTE.TURQUOISE.C12, FB_PALETTE.TURQUOISE.C4, FB_PALETTE.TURQUOISE.C9,
                FB_PALETTE.STIFFKEY.C11, FB_PALETTE.STIFFKEY.C2, FB_PALETTE.STIFFKEY.C9]}});
        break; // Fb Reazioni torta
      case FB_CHART.REACTIONS_LINEA:
        formattedData = this.areaChart( data,
          {
            options : {vAxis : {minValue: this.getMinChartStep(D_TYPE.FB, data, 0.8)},
              colors: [FB_PALETTE.STIFFKEY.C8]}
          }
        );
        break; // Fb Reazioni linea
      case FB_CHART.REACTIONS_COLUMN_CHART:
        formattedData = this.columnChart(data,
          {options: { colors: [FB_PALETTE.TURQUOISE.C6, FB_PALETTE.TURQUOISE.C8, FB_PALETTE.TURQUOISE.C10],
            }});
        break; // Fb Reazioni colonna
      case FB_CHART.PAGE_VIEW_EXTERNALS:
        formattedData = this.tableChart(data);
        break; // Fb Domini dei referenti esterni (elenco)
      case FB_CHART.PAGE_VIEW_EXTERNALS_LINEA:
        formattedData = this.areaChart( data,
          {
            options : {vAxis : {minValue: this.getMinChartStep(D_TYPE.FB, data, 0.8)},
              colors: [FB_PALETTE.TURQUOISE.C3]}});

        break; // Fb Domini dei referenti esterni (linea)
      case FB_CHART.PAGE_IMPRESSIONS_CITY:
        formattedData = this.tableChart(data);
        break; // Fb Vista contenuti per città (elenco)
      case FB_CHART.PAGE_IMPRESSIONS_CITY_GEO:
        formattedData = this.geoChart(data, { options : {
            region: 'IT',
            displayMode: 'markers',
            colors: [FB_PALETTE.BLUE.C2]}} );
        break; // //Fb Vista contenuti per città (geomappa)
      case FB_CHART.PAGE_IMPRESSIONS_COUNTRY_ELENCO:
        formattedData = this.tableChart(data);
        break; // Fb Vista contenuti per Paese (elenco)
      case FB_CHART.PAGE_FANS_CITY_ELENCO:
        formattedData = this.tableChart(data);
        break; // Facebook Fan City per elenco
      case FB_CHART.PAGE_FANS_AGE_ELENCO:
        formattedData = this.columnChart(data,
          {formatters: [{columns: [1, 2], type: 'NumberFormat', options: {pattern: '#.##'}}],
            options: { vAxis: {gridlines: {color: '#eaeaea', count: 5}, textPosition: 'in', textStyle: {color: '#999'}, format: '#'},
              colors: [FB_PALETTE.BLUE.C8, IG_PALETTE.AMARANTH.C10]}});
        break; // Facebook Fan Age per elenco
      case FB_CHART.ONLINE_FANS_FOR_DAY:
        formattedData = this.columnChart(data,
          {options: { colors: [FB_PALETTE.TURQUOISE.C6, FB_PALETTE.TURQUOISE.C8, FB_PALETTE.TURQUOISE.C10],
            }});
        break; //Facebook Fan Online per ora (colonne)

      case GA_CHART.IMPRESSIONS_DAY:

        formattedData = this.areaChart( data,
          {
            options : {hAxis: { textStyle: {color: '#666', fontName: 'Roboto'}},
              vAxis : {minValue: this.getMinChartStep(D_TYPE.GA, data, 0.8)},
              colors: [GA_PALETTE.LIME.C6]}
          }
        );
        break;  // Google PageViews (impressions by day)
      case GA_CHART.SESSION_DAY:
        formattedData = this.areaChart( data,
          {
            options : {hAxis: { textStyle: {color: '#666', fontName: 'Roboto'}},
              colors: [GA_PALETTE.OCHER.C8]}}
        );
        break;  // Google Sessions
      case GA_CHART.SOURCES_PIE:
        formattedData = this.pieChart(data,
          { formatters: [{ columns: [1],  type: 'NumberFormat', options: { pattern: '#.##' } }],
            options: {colors: [GA_PALETTE.ORANGE.C12, GA_PALETTE.LIME.C7, GA_PALETTE.OCHER.C9, GA_PALETTE.ORANGE.C11]}});
        break;  // Google Sources Pie
      case GA_CHART.MOST_VISITED_PAGES:
        formattedData = this.tableChart(data);
        break;  // Google List Referral
      case GA_CHART.SOURCES_COLUMNS:
        formattedData = this.columnChart(data,
          { formatters: [{ columns: [1],  type: 'NumberFormat', options: { pattern: '#.##' } }],
            options: {chartArea: {left: 0, right: 0, height: 310, top: 0},
              height: 330,
              vAxis: {gridlines: {color: '#eaeaea', count: 5}, minorGridlines: {color: 'transparent'},
                textPosition: 'in', textStyle: {color: '#999'}, format: '#'}, colors: [GA_PALETTE.ORANGE.C9],
              bar: {groupWidth: '70%'},  areaOpacity: 0.3 } } );

        break;  // Google Sources Column Chart
      case GA_CHART.BOUNCE_RATE:
        type = 'ga_bounce';
        // average = sum / data.length;
        formattedData = this.areaChart( data,
          {
            formatters: [{ columns: [1],  type: 'NumberFormat', options: { pattern: '#.##' } }],
            options : { chartArea: {left: 0, right: 0, height: 192, top: 0},
              vAxis : {minValue: this.getMinChartStep(D_TYPE.GA, data, 0.8)},
              colors: [GA_PALETTE.OCHER.C11]},
          });
        break; // Google BounceRate
      case GA_CHART.AVG_SESS_DURATION:
        formattedData = this.areaChart( data,
          {
            formatters: [{ columns: [1],  type: 'NumberFormat', options: { pattern: '#.##' } }],
            options : { chartArea: {left: 0, right: 0, height: 210, top: 0},
              vAxis : {minValue: this.getMinChartStep(D_TYPE.GA, data, 0.8)},
              colors: [GA_PALETTE.ORANGE.C3]},
          });
        break; // Google Average Session Duration
      case GA_CHART.BROWSER_SESSION:
        formattedData = this.tableChart(data);
        break; // Google list sessions per browser
      case GA_CHART.NEW_USERS:
        formattedData = this.areaChart( data,
          {
            formatters: [{ columns: [1],  type: 'NumberFormat', options: { pattern: '#.##' } }],
            options : { chartArea: {left: 0, right: 0, height: 210, top: 0},
              vAxis : {minValue: this.getMinChartStep(D_TYPE.GA, data, 0.8)},
              colors: [GA_PALETTE.OCHER.C11]},
          });
        break; // GA new users
      case GA_CHART.MOBILE_DEVICES:
        formattedData = this.tableChart(data);
        break; // GA mobile devices per session
      case GA_CHART.PERCENT_NEW_SESSION:
        formattedData = this.pieChart(data,
          {options: {colors: [GA_PALETTE.ORANGE.C7, GA_PALETTE.LIME.C7]}});
        break;  // Google New Users vs Returning
      case GA_CHART.PAGE_LOAD_TIME:

        formattedData = {
          chartType: 'BarChart',
          dataTable: data,
          chartClass: 9,
          options: {
            chartArea: {left: 0, right: 0, height: 310, top: 0},
            legend: {position: 'none'},
            height: 330,
            vAxis: {
              gridlines: {color: '#eaeaea', count: 5},
              minorGridlines: {color: 'transparent'},
              textPosition: 'in',
              textStyle: {color: '#000'}
            },
            colors: [GA_PALETTE.LIME.C6],
            bar: {groupWidth: '10%'},
            areaOpacity: 0.3
          }
        };
        break;

      case GA_CHART.GENDER_AGE:
        data.forEach(d => d[4] > val ? val = d[4] : val);
       // data.forEach(d => d[1] < val2 ? val2 = d[1] : val2);
        //val2 = val2 * -1;

        formattedData = {
          chartType: 'BarChart',
          dataTable: data,
          chartClass: 9, // TODO delete
          formatters: [
            {
              columns: [1],
              type: 'NumberFormat',
              options: {
                pattern: ';',
              }
            },
          ],
          options: {
            isStacked: true,
            chartArea: {
              left: '3%',
              top: '0%',
              width: '94%',
              height: '90%'
            },
            height: 310,
            bar: {
              groupWidth: '70%'
            },
            legend: {
              position: 'none'
            },
            hAxis: {
              ticks: [
                {v: this.searchStep(val) , f: this.searchStep(val).toString()},
                {v: this.searchStep(val / 2), f: this.searchStep(val / 2).toString()},
                {v: 0, f: '0'},
                {v: this.searchStep(val / 2) * -1, f: this.searchStep(val / 2).toString()},
                {v: this.searchStep(val) * -1, f: this.searchStep(val).toString()}
              ],
              format: ';',
            }, // horizontal label
            vAxis: {
              gridlines: {color: '#eaeaea', count: 7},
              direction: -1 /* value responsible for inverse the bar chart from desending to accending order */
            },
            animation: {
              duration: 1000,
              easing: 'out',
              startup: true
            },
            annotations: {
              textStyle: {
                fontSize: 13,
                bold: true,
                italic: true,
                // The color of the text.
                color: '#000000',
                // The color of the text outline.
                auraColor: '#FFFFFF',
                // The transparency of the text.
                opacity: 1.4
              }
            }
          }
        };
        break;

      case GA_CHART.USER_ONLINE:
        formattedData = {
          chartType: 'LineChart',
          dataTable: data,
          formatters: [{ columns: [1],  type: 'NumberFormat', options: { pattern: '#.##' } }],
          options: {
            chartArea: {left: 0, right: 0, height: 192, top: 0},
            legend: {position: 'top'},
            lineWidth: data.length > 15 ? (data.length > 40 ? 2 : 3) : 4,
            height: 220,
            pointSize: data.length > 15 ? 0 : 7,
            pointShape: 'circle',
            hAxis: {gridlines: {color: 'transparent'}, textStyle: {color: '#999', fontName: 'Roboto'}, minTextSpacing: 20},
            vAxis: {
              gridlines: {color: '#eaeaea', count: 5},
              minorGridlines: {color: 'transparent'},
              minValue: 0,
              textPosition: 'in',
              textStyle: {color: '#999'},
            },
            colors: [IG_PALETTE.IG_COLORS.C6, IG_PALETTE.IG_COLORS.C1],
            areaOpacity: 0.1
          }
        };
        break;
      case GA_CHART.AUD_REGION_GO:
        formattedData = this.geoChart(data, { options : {
            region: 'IT',
            displayMode: 'markers',
            colors: [GA_PALETTE.LIME.C1]}} );
        break;  // Geo Map
      case GA_CHART.SESSION_ELENCO_GO:
        formattedData = this.tableChart(data);
        break;


      case GA_CHART.ADS:
        formattedData = {
          chartType: 'LineChart',
          dataTable: data,
          options: {
            chartArea: {left: 0, right: 0, height: 270, top: 20},
            legend: {position: 'top'},
            lineWidth: data.length > 15 ? (data.length > 40 ? 2 : 3) : 4,
            height: 330,
            pointSize: data.length > 15 ? 0 : 7,
            pointShape: 'circle',
            hAxis: {gridlines: {color: 'transparent'}, textStyle: {color: '#999', fontName: 'Roboto'}, minTextSpacing: 20},
            vAxis: {
              gridlines: {color: '#eaeaea', count: 5},
              minorGridlines: {color: 'transparent'},
              minValue: 0,
              textPosition: 'in',
              textStyle: {color: '#999'},
            },
            colors: [IG_PALETTE.IG_COLORS.C6, IG_PALETTE.IG_COLORS.C1],
            areaOpacity: 0.1
          }
        };
        break;

      case GA_CHART.USER_LAST_SESSION:
        formattedData = this.columnChart(data,
          {
            options: {
              vAxis: {gridlines: {color: '#eaeaea', count: 5}, minorGridlines: {color: '#ffffff'}, textPosition: 'in', textStyle: {color: '#999'}, format: '#'},
              hAxis: {gridlines: {color: 'transparent', count: 5}, minorGridlines: {color: '#ffffff'}, textStyle: {color: '#000000', fontName: 'Roboto'}},
              colors: [FB_PALETTE.BLUE.C8, IG_PALETTE.AMARANTH.C10]}});
        break;
      // Instragram chart
      case IG_CHART.AUD_CITY:
        formattedData = this.tableChart(data,
          {formatters: [{columns: [1], type: 'ArrowFormat', options: {pattern: '#.##'}
            }]});
        break; // IG Follower City
      case IG_CHART.AUD_COUNTRY:
        formattedData = this.geoChart(data, { options : {
            region: 'world',
            ccolors: [IG_PALETTE.AMARANTH.C5],
            colorAxis: {colors: [IG_PALETTE.AMARANTH.C9, IG_PALETTE.AMARANTH.C4]}}} );
        break; // IG Follower Country
      case IG_CHART.AUD_GENDER_AGE:
        formattedData = this.columnChart(data,
          {formatters: [{columns: [1, 2], type: 'NumberFormat', options: {pattern: '#.##'}}],
            options: {
              vAxis: {gridlines: {color: '#eaeaea', count: 5}, minorGridlines: {color: '#ffffff'}, textPosition: 'in', textStyle: {color: '#999'}, format: '#'},
              hAxis: {gridlines: {color: 'transparent', count: 5}, minorGridlines: {color: '#ffffff'}, textStyle: {color: '#000000', fontName: 'Roboto'}},
              colors: [FB_PALETTE.BLUE.C8, IG_PALETTE.AMARANTH.C10]}});
        break; // IG Follower Gender/Age
      case IG_CHART.AUD_LOCALE:
        formattedData = this.columnChart(data,
          {formatters: [{columns: [1], type: 'NumberFormat', options: {pattern: '#.##'}}],
            options: { chartArea: {left: 30, right: 0, height: 270, top: 5},
              height: 315, vAxis: {  textPosition: 'out', format: '#'},
              hAxis: {gridlines: {color: 'transparent'}, textStyle: {color: '#000000', fontName: 'Roboto'}},
              colors: [IG_PALETTE.FUCSIA.C5],
              areaOpacity: 0.4,
              bar: {groupWidth: '50%'}}});
        break; // IG Follower Locale
      case IG_CHART.ONLINE_FOLLOWERS:
        formattedData = this.columnChart(data,
          {formatters: [{columns: [1, 2, 3], type: 'NumberFormat', options: {pattern: '#.##'}}],
            options: { chartArea: {left: 0, right: 0, height: 270, top: 20},  height: 310,
              vAxis: {gridlines: {color: '#eaeaea', count: 5}, textPosition: 'in', textStyle: {color: '#999'}, format: '#'},
              hAxis: {textStyle: {color: '#000000', fontName: 'Roboto', fontSize: 9}},
              colors: [IG_PALETTE.FUCSIA.C5, IG_PALETTE.AMARANTH.C3, IG_PALETTE.LAVENDER.C3],
              areaOpacity: 0.4,
              legend: {position: 'top', maxLines: 3},
              bar: {groupWidth: '60%'}}});
        break; // IG Online followers
      case IG_CHART.IMPRESSIONS:
        formattedData = this.areaChart( data,
          {
            formatters: [{ columns: [1],  type: 'NumberFormat', options: { pattern: '#.##' } }],
            options : {vAxis : {minValue: 0}, colors: [IG_PALETTE.LAVENDER.C3]}});
        break; // IG Impressions by day
      case IG_CHART.REACH:
        formattedData = this.areaChart( data,
          {
            formatters: [{ columns: [1],  type: 'NumberFormat', options: { pattern: '#.##' } }],
            options : {vAxis : {minValue: 0}, colors: [IG_PALETTE.IG_COLORS.C6]}});
        break; // IG Reach
      case IG_CHART.ACTION_PERFORMED:
        formattedData = this.pieChart(data,
          {sliceVisibilityThreshold: 0.05,
            options: {colors: [IG_PALETTE.FUCSIA.C5, IG_PALETTE.FUCSIA.C3, IG_PALETTE.LAVENDER.C1, IG_PALETTE.AMARANTH.C11]}});
        if (data.filter(e => e[1] === true).length == 0) {
          formattedData.options.colors = [IG_PALETTE.FUCSIA.C5, IG_PALETTE.FUCSIA.C2, IG_PALETTE.LAVENDER.C9, IG_PALETTE.AMARANTH.C7];
          formattedData.dataTable = data;
        } else {
          formattedData.options.colors = ['#D3D3D3'];
          formattedData.dataTable = data.slice(0, 2);
        }
        break; // IG clicks pie
      case IG_CHART.FOLLOWER_COUNT:
        formattedData = this.areaChart( data,
          {
            formatters: [{ columns: [1],  type: 'NumberFormat', options: { pattern: '#.##' } }],
            options : {vAxis : {minValue: 0}, colors: [IG_PALETTE.AMARANTH.C5]}});

        break; // IG Follower count
      case IG_CHART.LOST_FOLLOWERS:
        formattedData = {
          chartType: 'AreaChart',
          dataTable: data,
          options: {
            chartArea: {left: 0, right: 0, height: 290, top: 0},
            legend: {position: 'none'},
            lineWidth: data.length > 15 ? (data.length > 40 ? 2 : 3) : 4,
            height: 330,
            pointSize: data.length > 15 ? 0 : 7,
            pointShape: 'circle',
            hAxis: {gridlines: {color: 'transparent'}, textStyle: {color: '#999', fontName: 'Roboto'}, minTextSpacing: 15},
            vAxis: {
              gridlines: {color: '#eaeaea', count: 5},
              minorGridlines: {color: 'transparent'},
              minValue: 0,
              textPosition: 'in',
              textStyle: {color: '#999'},
              colors: [IG_PALETTE.AMARANTH.C5]
            },
            areaOpacity: 0.1
          }
        };
        break;
      case IG_CHART.INFO_CLICKS_COL:
        formattedData = this.columnChart(data,
          {formatters: [{columns: [1], type: 'NumberFormat', options: {pattern: '#.##'}}],
            options: { chartArea: {left: 0, right: 0, height: 270, top: 0},
              vAxis: { minValue: 0, viewWindowMode: 'explicit', viewWindow: {min: 0, max: 50}, gridlines: {color: '#eaeaea', count: 5},
                textPosition: 'in', textStyle: {color: '#999'}, format: '#'},
              colors: [IG_PALETTE.LAVENDER.C6, IG_PALETTE.AMARANTH.C8, IG_PALETTE.FUCSIA.C9, IG_PALETTE.AMARANTH.C1,
                IG_PALETTE.FUCSIA.C1],
              areaOpacity: 0.4,
              bar: {groupWidth: '75%'}, isStacked: true}});
        break;

      case IG_CHART.MEDIA_LIKE_DATA:
        formattedData = this.areaChart( data,
          {options :  {chartArea: {left: 0, right: 0, height: 185, top: 0}, vAxis: {
                viewWindowMode: 'explicit',
                viewWindow: {min: 0},
              }, colors: [IG_PALETTE.AMARANTH.C1]}});
        break;

      case IG_CHART.MEDIA_ENGAGEMENT_DATA:
        formattedData = this.areaChart( data,
          {options :  {chartArea: {left: 0, right: 0, height: 185, top: 0}, vAxis: {
                viewWindowMode: 'explicit',
                viewWindow: {min: 0},
              }, colors: [IG_PALETTE.AMARANTH.C1]}});
        break;

      case IG_CHART.MEDIA_LIKE_TYPE:
        formattedData = {
          chartType: 'BarChart',
          dataTable: data,
          formatters: [{
            columns: [1],
            type: 'NumberFormat',
            options: {
              pattern: '#.##'
            }
          }],
          chartClass: 9,
          options: {
            chartArea: {left: 5, right: 20, height: 270, top: 0},
            height: 310,
            vAxis: {
              minValue: 0,
              gridlines: {color: '#eaeaea', count: 5},
              minorGridlines: {color: 'transparent'},
              textPosition: 'in',
              textStyle: {color: '#999', fontSize: 13},
            },
            hAxis: {
              format: '#'
            },
            areaOpacity: 0.4,
            bar: {groupWidth: '50%'},
          }
        };
        break;
      case IG_CHART.MEDIA_ENGAGEMENT_TYPE:
        formattedData = {
          chartType: 'BarChart',
          dataTable: data,
          formatters: [{
            columns: [1],
            type: 'NumberFormat',
            options: {
              pattern: '#.##'
            }
          }],
          chartClass: 9,
          options: {
            chartArea: {left: 5, right: 20, height: 270, top: 0},
            height: 310,
            vAxis: {
              minValue: 0,
              gridlines: {color: '#eaeaea', count: 5},
              minorGridlines: {color: '#ffffff', count: 0},
              textPosition: 'in',
              textStyle: {color: '#999', fontSize: 13},
            },
            hAxis: {
              format: '#'
            },
            areaOpacity: 0.4,
            bar: {groupWidth: '50%'},
          }
        };
        break;

      case IG_CHART.REACH_IMPRESSION_DATA:
        formattedData = {
          chartType: 'LineChart',
          dataTable: data,
          formatters: [{columns: [1, 3], type: 'NumberFormat', options: {pattern: '#.##'}}],
          options: {
            chartArea: {left: 0, right: 0, height: 270, top: 20},
            legend: {position: 'top'},
            lineWidth: data.length > 15 ? (data.length > 40 ? 2 : 3) : 4,
            height: 330,
            pointSize: data.length > 15 ? 0 : 7,
            pointShape: 'circle',
            hAxis: {gridlines: {color: 'transparent'}, textStyle: {color: '#999', fontName: 'Roboto'}, minTextSpacing: 20},
            vAxis: {
              gridlines: {color: '#eaeaea', count: 5},
              minorGridlines: {color: 'transparent'},
              minValue: 0,
              textPosition: 'in',
              textStyle: {color: '#999'},
              format: '##'
            },
            colors: [IG_PALETTE.IG_COLORS.C6, IG_PALETTE.IG_COLORS.C1],
            areaOpacity: 0.1
          }
        };
        break;

      case IG_CHART.REACH_IMPRESSION_TYPE:
        formattedData = this.columnChart(data,
          {formatters: [{columns: [1, 3], type: 'NumberFormat', options: {pattern: '#.##'}}],
            options: { chartArea: {left: 0, right: 0, height: 270, top: 20},
              vAxis: { minValue: 0, viewWindowMode: 'explicit', viewWindow: {min: 0}, gridlines: {color: '#eaeaea', count: 5},
                textPosition: 'in', textStyle: {color: '#999'}, format: '##'},
              hAxis: {
                gridlines: {color: '#eaeaea', count: 5},
                minorGridlines: {color: 'trasparent'}
              },
              areaOpacity: 0.4,
              bar: {groupWidth: '50%'}, isStacked: false}});
        break;

      case IG_CHART.COMPARISON_COLONNA:

        formattedData = {
          chartType: 'ColumnChart',
          dataTable: data,
          formatters: [{
            columns: [1, 2],
            type: 'NumberFormat',
            options: {
              pattern: '###.##'
            }
          }],
          chartClass: 9,
          options: {
            chartArea: {left: 30, right: 0, height: 270, top: 20},
            height: 310,
            vAxis: {gridlines: {color: '#eaeaea', count: 10}, textPosition: 'out', textStyle: {color: '#999'}, format: '#'},
            hAxis: {textStyle: {color: '#000000', fontName: 'Roboto', fontSize: 9}},
            colors: [IG_PALETTE.LAVENDER.C6, IG_PALETTE.AMARANTH.C8],
            areaOpacity: 0.4,
            legend: {position: 'top', maxLines: 2},
            bar: {groupWidth: '30%'},
            isStacked: true,
          }
        };

        break; // IG Follower Count Comparasion
      case IG_CHART.AUD_CITY_GEOMAPPA:
        formattedData = this.geoChart(data, { options : {
            region: 'world',
            displayMode: 'markers',
            colorAxis: {colors: [IG_PALETTE.AMARANTH.C5]}
          }});
        break; // IG Follower City - Geomappa
      case IG_CHART.AUD_GENDER_AGE_TORTA:

        formattedData = {
          chartType: 'PieChart',
          dataTable: data,
          chartClass: 8,
          options: {
            chartArea: {left: 100, right: 0, height: 290, top: 20},
            legend: {position: 'right'},
            colors: ['#ff32b9', '#0676ff'],
            height: 310,
            is3D: false,
            pieHole: 0.55,
            pieSliceText: 'percentage',
            pieSliceTextStyle: {fontSize: 12, color: 'white'},
            areaOpacity: 0.2
          }
        };
        /*
        formattedData = this.pieChart(data,
          {options: {colors: [GA_PALETTE.ORANGE.C7, GA_PALETTE.LIME.C7]}});
         */
        break; // IG Follower Gender/Age - Torta
      case IG_CHART.AUD_COUNTRY_ELENCO:
        formattedData = this.tableChart(data,
          {formatters: [{columns: [1], type: 'ArrowFormat', options: {pattern: '#.##'}
            }]});
        break; // IG Follower Country - Elenco

      case YT_CHART.VIEWS:
        formattedData = this.areaChart( data,
          {options : {colors: [YT_PALETTE.RED.C11]}});
        break;
      case YT_CHART.COMMENTS:
        formattedData = this.areaChart( data,
          {options : {colors: [YT_PALETTE.OPAL.C2]}});
        break;
      case YT_CHART.LIKES:
        formattedData = this.areaChart( data,
          {options : {colors: [YT_PALETTE.BROWN.C9]}});
        break;
      case YT_CHART.DISLIKES:
        formattedData = this.areaChart( data,
          {options : {colors: [YT_PALETTE.RED.C12]}});
        break;
      case YT_CHART.SHARES:
        formattedData = this.areaChart( data,
          {options : {colors: [YT_PALETTE.OPAL.C8]}});
        break;
      case YT_CHART.AVGVIEW:
        formattedData = this.areaChart( data,
          {options : {colors: [YT_PALETTE.BROWN.C10]}});
        break;
      case YT_CHART.ESTWATCH:
        formattedData = this.areaChart( data,
          {options : {colors: [YT_PALETTE.RED.C3]}});
        break;

      case FBM_CHART.AGE_REACH:

        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.AGE_IMPRESSIONS:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.AGE_SPEND:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.AGE_INLINE:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.AGE_CLICKS:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.AGE_CPC:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.AGE_CPP:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.AGE_CTR:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;

      case FBM_CHART.GENDER_REACH:
        formattedData = this.pieChart(data,
          {sliceVisibilityThreshold: 0.05,
            options: { colors: ['#FF19FF', '#1940FF', '#F1C85B', '#D9C9B6']}});
        break;
      case FBM_CHART.GENDER_IMPRESSIONS:
        formattedData = this.pieChart(data,
          {sliceVisibilityThreshold: 0.05,
            options: { colors: ['#FF19FF', '#1940FF', '#F1C85B', '#D9C9B6']}});
        break;
      case FBM_CHART.GENDER_SPEND:
        formattedData = this.pieChart(data,
          {sliceVisibilityThreshold: 0.05,
            options: { colors: ['#FF19FF', '#1940FF', '#F1C85B', '#D9C9B6']}});
        break;
      case FBM_CHART.GENDER_INLINE:
        formattedData = this.pieChart(data,
          {sliceVisibilityThreshold: 0.05,
            options: { colors: ['#FF19FF', '#1940FF', '#F1C85B', '#D9C9B6']}});
        break;
      case FBM_CHART.GENDER_CLICKS:
        formattedData = this.pieChart(data,
          {sliceVisibilityThreshold: 0.05,
            options: { colors: ['#FF19FF', '#1940FF', '#F1C85B', '#D9C9B6']}});
        break;
      case FBM_CHART.GENDER_CPC:
        formattedData = this.pieChart(data,
          {sliceVisibilityThreshold: 0.05,
            options: { colors: ['#FF19FF', '#1940FF', '#F1C85B', '#D9C9B6']}});
        break;
      case FBM_CHART.GENDER_CPP:
        formattedData = this.pieChart(data,
          {sliceVisibilityThreshold: 0.05,
            options: { colors: ['#FF19FF', '#1940FF', '#F1C85B', '#D9C9B6']}});
        break;
      case FBM_CHART.GENDER_CTR:
        formattedData = this.pieChart(data,
          {sliceVisibilityThreshold: 0.05,
            options: { colors: ['#FF19FF', '#1940FF', '#F1C85B', '#D9C9B6']}});
        break;

      case FBM_CHART.GENDER_AGE_REACH:
        data.forEach(d => d[4] > val ? val = d[4] : val);

        formattedData = {
          chartType: 'BarChart',
          dataTable: data,
          chartClass: 9, // TODO delete
          formatters: [
            {
              columns: [1],
              type: 'NumberFormat',
              options: {
                pattern: ';',
              }
            },
          ],
          options: {
            isStacked: true,
            chartArea: {
              left: '3%',
              top: '0%',
              width: '94%',
              height: '90%'
            },
            height: 310,
            bar: {
              groupWidth: '70%'
            },
            legend: {
              position: 'none'
            },
            hAxis: {
              ticks: [
                {v: this.searchStep(val) * -1, f: this.searchStep(val).toString()},
                {v: this.searchStep(val / 2) * -1, f: this.searchStep(val / 2).toString()},
                {v: 0, f: '0'},
                {v: this.searchStep(val / 2), f: this.searchStep(val / 2).toString()},
                {v: this.searchStep(val), f: this.searchStep(val).toString()}
              ],
              format: ';',
            }, // horizontal label
            vAxis: {
              gridlines: {color: '#eaeaea', count: 7},
              direction: -1 /* value responsible for inverse the bar chart from desending to accending order */
            },
            animation: {
              duration: 1000,
              easing: 'out',
              startup: true
            },
            annotations: {
              textStyle: {
                fontSize: 13,
                bold: true,
                italic: true,
                // The color of the text.
                color: '#000000',
                // The color of the text outline.
                auraColor: '#FFFFFF',
                // The transparency of the text.
                opacity: 1.4
              }
            }
          }
        };

        break;
      case FBM_CHART.GENDER_AGE_IMPRESSIONS:
        data.forEach(d => d[4] > val ? val = d[4] : val);
        formattedData = {
          chartType: 'BarChart',
          dataTable: data,
          chartClass: 9, // TODO delete
          formatters: [
            {
              columns: [1],
              type: 'NumberFormat',
              options: {
                pattern: ';',
              }
            },
          ],
          options: {
            isStacked: true,
            chartArea: {
              left: '3%',
              top: '0%',
              width: '94%',
              height: '90%'
            }, height: 310,
            bar: {
              groupWidth: '70%'
            },
            legend: {
              position: 'none'
            },
            hAxis: {
              ticks: [
                {v: this.searchStep(val) * -1, f: this.searchStep(val).toString()},
                {v: this.searchStep(val / 2) * -1, f: this.searchStep(val / 2).toString()},
                {v: 0, f: '0'},
                {v: this.searchStep(val / 2), f: this.searchStep(val / 2).toString()},
                {v: this.searchStep(val), f: this.searchStep(val).toString()}
              ],
              format: ';',
            },
            vAxis: {
              gridlines: {color: '#eaeaea', count: 7},
              direction: -1 /* value responsible for inverse the bar chart from desending to accending order */
            },
            animation: {
              duration: 1000,
              easing: 'out',
              startup: true
            },
            annotations: {
              textStyle: {
                fontSize: 13,
                bold: true,
                italic: true,
                // The color of the text.
                color: '#000000',
                // The color of the text outline.
                auraColor: '#FFFFFF',
                // The transparency of the text.
                opacity: 1.4
              }
            }
          }
        };

        break;
      case FBM_CHART.GENDER_AGE_SPEND:
        data.forEach(d => d[4] > val ? val = d[4] : val);

        formattedData = {
          chartType: 'BarChart',
          dataTable: data,
          chartClass: 9, // TODO delete
          formatters: [
            {
              columns: [1],
              type: 'NumberFormat',
              options: {
                pattern: ';',
              }
            },
          ],
          options: {
            isStacked: true,
            chartArea: {
              left: '3%',
              top: '0%',
              width: '94%',
              height: '90%'
            }, height: 310,
            bar: {
              groupWidth: '70%'
            },
            legend: {
              position: 'none'
            },
            hAxis: {
              ticks: [
                {v: this.searchStep(val) * -1, f: this.searchStep(val).toString()},
                {v: this.searchStep(val / 2) * -1, f: this.searchStep(val / 2).toString()},
                {v: 0, f: '0'},
                {v: this.searchStep(val / 2), f: this.searchStep(val / 2).toString()},
                {v: this.searchStep(val), f: this.searchStep(val).toString()}
              ],
              format: ';',
            },
            vAxis: {
              gridlines: {color: '#eaeaea', count: 7},
              direction: -1 /* value responsible for inverse the bar chart from desending to accending order */
            },
            animation: {
              duration: 1000,
              easing: 'out',
              startup: true
            },
            annotations: {
              textStyle: {
                fontSize: 13,
                bold: true,
                italic: true,
                // The color of the text.
                color: '#000000',
                // The color of the text outline.
                auraColor: '#FFFFFF',
                // The transparency of the text.
                opacity: 1.4
              }
            }
          }
        };
        break;
      case FBM_CHART.GENDER_AGE_INLINE:
        data.forEach(d => d[4] > val ? val = d[4] : val);

        formattedData = {
          chartType: 'BarChart',
          dataTable: data,
          chartClass: 9, // TODO delete
          formatters: [
            {
              columns: [1],
              type: 'NumberFormat',
              options: {
                pattern: ';',
              }
            },
          ],
          options: {
            isStacked: true,
            chartArea: {
              left: '3%',
              top: '0%',
              width: '94%',
              height: '90%'
            }, height: 310,
            bar: {
              groupWidth: '70%'
            },
            legend: {
              position: 'none'
            },
            hAxis: {
              ticks: [
                {v: this.searchStep(val) * -1, f: this.searchStep(val).toString()},
                {v: this.searchStep(val / 2) * -1, f: this.searchStep(val / 2).toString()},
                {v: 0, f: '0'},
                {v: this.searchStep(val / 2), f: this.searchStep(val / 2).toString()},
                {v: this.searchStep(val), f: this.searchStep(val).toString()}
              ],
              format: ';',
            },
            vAxis: {
              gridlines: {color: '#eaeaea', count: 7},
              direction: -1 /* value responsible for inverse the bar chart from desending to accending order */
            },
            animation: {
              duration: 1000,
              easing: 'out',
              startup: true
            },
            annotations: {
              textStyle: {
                fontSize: 13,
                bold: true,
                italic: true,
                // The color of the text.
                color: '#000000',
                // The color of the text outline.
                auraColor: '#FFFFFF',
                // The transparency of the text.
                opacity: 1.4
              }
            }
          }
        };
        break;
      case FBM_CHART.GENDER_AGE_CLICKS:
        data.forEach(d => d[4] > val ? val = d[4] : val);

        formattedData = {
          chartType: 'BarChart',
          dataTable: data,
          chartClass: 9, // TODO delete
          formatters: [
            {
              columns: [1],
              type: 'NumberFormat',
              options: {
                pattern: ';',
              }
            },
          ],
          options: {
            isStacked: true,
            chartArea: {
              left: '3%',
              top: '0%',
              width: '94%',
              height: '90%'
            }, height: 310,
            bar: {
              groupWidth: '70%'
            },
            legend: {
              position: 'none'
            },
            hAxis: {
              ticks: [
                {v: this.searchStep(val) * -1, f: this.searchStep(val).toString()},
                {v: this.searchStep(val / 2) * -1, f: this.searchStep(val / 2).toString()},
                {v: 0, f: '0'},
                {v: this.searchStep(val / 2), f: this.searchStep(val / 2).toString()},
                {v: this.searchStep(val), f: this.searchStep(val).toString()}
              ],
              format: ';',
            },
            vAxis: {
              gridlines: {color: '#eaeaea', count: 7},
              direction: -1 /* value responsible for inverse the bar chart from desending to accending order */
            },
            animation: {
              duration: 1000,
              easing: 'out',
              startup: true
            },
            annotations: {
              textStyle: {
                fontSize: 13,
                bold: true,
                italic: true,
                // The color of the text.
                color: '#000000',
                // The color of the text outline.
                auraColor: '#FFFFFF',
                // The transparency of the text.
                opacity: 1.4
              }
            }
          }
        };
        break;
      case FBM_CHART.GENDER_AGE_CPC:
        data.forEach(d => d[4] > val ? val = d[4] : val);

        formattedData = {
          chartType: 'BarChart',
          dataTable: data,
          chartClass: 9, // TODO delete
          formatters: [
            {
              columns: [1],
              type: 'NumberFormat',
              options: {
                pattern: ';',
              }
            },
          ],
          options: {
            isStacked: true,
            chartArea: {
              left: '3%',
              top: '3%',
              width: '94%',
              height: '90%'
            },
            height: 310,
            bar: {
              groupWidth: '70%'
            },
            legend: {
              position: 'none'
            },
            hAxis: {
              ticks: [
                {v: this.searchStep(val) * -1, f: this.searchStep(val).toString()},
                {v: this.searchStep(val / 2) * -1, f: this.searchStep(val / 2).toString()},
                {v: 0, f: '0'},
                {v: this.searchStep(val / 2), f: this.searchStep(val / 2).toString()},
                {v: this.searchStep(val), f: this.searchStep(val).toString()}
              ],
              format: ';',
            },
            vAxis: {
              gridlines: {color: '#eaeaea', count: 7},
              direction: -1 /* value responsible for inverse the bar chart from desending to accending order */
            },
            animation: {
              duration: 1000,
              easing: 'out',
              startup: true
            },
            annotations: {
              textStyle: {
                fontSize: 13,
                bold: true,
                italic: true,
                // The color of the text.
                color: '#000000',
                // The color of the text outline.
                auraColor: '#FFFFFF',
                // The transparency of the text.
                opacity: 1.4
              }
            }
          }
        };
        break;
      case FBM_CHART.GENDER_AGE_CPP:
        data.forEach(d => d[4] > val ? val = d[4] : val);

        formattedData = {
          chartType: 'BarChart',
          dataTable: data,
          chartClass: 9, // TODO delete
          formatters: [
            {
              columns: [1],
              type: 'NumberFormat',
              options: {
                pattern: ';',
              }
            },
          ],
          options: {
            isStacked: true,
            chartArea: {
              left: '3%',
              top: '0%',
              width: '94%',
              height: '90%'
            }, height: 310,
            bar: {
              groupWidth: '70%'
            },
            legend: {
              position: 'none'
            },
            hAxis: {
              ticks: [
                {v: this.searchStep(val) * -1, f: this.searchStep(val).toString()},
                {v: this.searchStep(val / 2) * -1, f: this.searchStep(val / 2).toString()},
                {v: 0, f: '0'},
                {v: this.searchStep(val / 2), f: this.searchStep(val / 2).toString()},
                {v: this.searchStep(val), f: this.searchStep(val).toString()}
              ],
              format: ';',
            },
            vAxis: {
              gridlines: {color: '#eaeaea', count: 7},
              direction: -1 /* value responsible for inverse the bar chart from desending to accending order */
            },
            animation: {
              duration: 1000,
              easing: 'out',
              startup: true
            },
            annotations: {
              textStyle: {
                fontSize: 13,
                bold: true,
                italic: true,
                // The color of the text.
                color: '#000000',
                // The color of the text outline.
                auraColor: '#FFFFFF',
                // The transparency of the text.
                opacity: 1.4
              }
            }
          }
        };
        break;
      case FBM_CHART.GENDER_AGE_CTR:
        data.forEach(d => d[4] > val ? val = d[4] : val);

        formattedData = {
          chartType: 'BarChart',
          dataTable: data,
          chartClass: 9, // TODO delete
          formatters: [
            {
              columns: [1],
              type: 'NumberFormat',
              options: {
                pattern: ';',
              }
            },
          ],
          options: {
            isStacked: true,
            chartArea: {
              left: '3%',
              top: '0%',
              width: '94%',
              height: '90%'
            }, height: 310,
            bar: {
              groupWidth: '70%'
            },
            legend: {
              position: 'none'
            },
            hAxis: {
              ticks: [
                {v: this.searchStep(val) * -1, f: this.searchStep(val).toString()},
                {v: this.searchStep(val / 2) * -1, f: this.searchStep(val / 2).toString()},
                {v: 0, f: '0'},
                {v: this.searchStep(val / 2), f: this.searchStep(val / 2).toString()},
                {v: this.searchStep(val), f: this.searchStep(val).toString()}
              ],
              format: ';',
            },
            vAxis: {
              gridlines: {color: '#eaeaea', count: 7},
              direction: -1 /* value responsible for inverse the bar chart from desending to accending order */
            },
            animation: {
              duration: 1000,
              easing: 'out',
              startup: true
            },
            annotations: {
              textStyle: {
                fontSize: 13,
                bold: true,
                italic: true,
                // The color of the text.
                color: '#000000',
                // The color of the text outline.
                auraColor: '#FFFFFF',
                // The transparency of the text.
                opacity: 1.4
              }
            }
          }
        };
        break;

      case FBM_CHART.COUNTRYREGION_REACH:
        /* formattedData = {
           chartType: 'GeoChart',
           dataTable: [
             ['City',   'Population', 'Area'],
             ['Rome',      2761477,    1285.31],
             ['Milan',     1324110,    181.76],
             ['Naples',    959574,     117.27],
             ['Turin',     907563,     130.17],
             ['Palermo',   655875,     158.9],
             ['Genoa',     607906,     243.60],
             ['Bologna',   380181,     140.7],
             ['Florence',  371282,     102.41],
             ['Fiumicino', 67370,      213.44],
             ['Anzio',     52192,      43.43],
             ['Ciampino',  38262,      11]
           ],
           containerId: 'chart_div',
           options: {
             region: 'IT',
             displayMode: 'markers',
             resolution: 'provinces',
             colorAxis: {colors: ['green', 'blue']}
           }
         };*/
        formattedData = this.tableChart(data);
        break;
      case FBM_CHART.COUNTRYREGION_IMPRESSIONS:
        formattedData = this.tableChart(data);
        break;
      case FBM_CHART.COUNTRYREGION_SPEND:
        formattedData = this.tableChart(data);
        break;
      case FBM_CHART.COUNTRYREGION_INLINE:
        formattedData = this.tableChart(data);
        break;
      case FBM_CHART.COUNTRYREGION_CLICKS:
        formattedData = this.tableChart(data);
        break;
      case FBM_CHART.COUNTRYREGION_CPC:
        formattedData = this.tableChart(data);
        break;
      case FBM_CHART.COUNTRYREGION_CPP:
        formattedData = this.tableChart(data);
        break;
      case FBM_CHART.COUNTRYREGION_CTR:
        formattedData = this.tableChart(data);
        break;

      case FBM_CHART.HOURLYADVERTISER_IMPRESSIONS:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.HOURLYADVERTISER_SPEND:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.HOURLYADVERTISER_INLINE:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.HOURLYADVERTISER_CLICKS:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.HOURLYADVERTISER_CPC:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.HOURLYADVERTISER_CTR:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;

      case FBM_CHART.HOURLYAUDIENCE_REACH:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.HOURLYAUDIENCE_IMPRESSIONS:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.HOURLYAUDIENCE_SPEND:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.HOURLYAUDIENCE_INLINE:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.HOURLYAUDIENCE_CLICKS:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.HOURLYAUDIENCE_CPC:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.HOURLYAUDIENCE_CPP:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;
      case FBM_CHART.HOURLYAUDIENCE_CTR:
        formattedData = this.columnChart(data,
          {options: { colors: ['#1b53ff']}});
        break;

    }
    return formattedData;
  }

  public addPaddingRows(chartData) {
    const paddingRows = chartData.length % 9 ? 9 - (chartData.length % 9) : 0;

    for (let i = 0; i < paddingRows; i++) {
      chartData.push(['', null]);
    }

    return chartData;
  }

  private getMaxChartStep(data) {
    const arr = data.slice(1);
    const max = Math.max.apply(null, arr.map(function(o) { return o[1]; }));
    return max + 10;
  }

  private getMinChartStep(type, data, perc = 0.8) {
    let min = 0, length;
    data = data.slice(1);

    if (data) {
      switch (type) {
        case D_TYPE.FBM:
        case D_TYPE.FB:
        case D_TYPE.IG:
          if (data.length > 0) {
            min = data.map(x => x[1]).reduce((c, p) => c < p ? c : p) * perc;
            break;
          }
          break;
        case D_TYPE.GA:
        case D_TYPE.YT:
          // if (data[0] && data[0].length) {
          length = data[0].length;
          min = data.reduce((p, c) => p[length - 1] < c[length - 1] ? p[length - 1] : c[length - 1]) * perc;
          // }
          break;
      }
    }

    return min;
  }

  public retrieveMiniChartData(serviceID: number, pageIDs?, intervalDate?: IntervalDate, permissions?) {
    const observables: Array<Observable<any>> = [];
    let params: ChartParams = {};
    let pageID;

    switch (serviceID) {
      case D_TYPE.FB:
        pageID = pageIDs[D_TYPE.FB];
        observables.push(this.facebookService.getData('page_fans', pageID));
        observables.push(this.facebookService.fbPosts(pageID));
        observables.push(this.facebookService.getData('page_actions_post_reactions_total', pageID));
        // observables.push(this.facebookService.getData('page_impressions_unique', pageID));
        observables.push(this.facebookService.getData('page_views_total', pageID));
        break;
      case D_TYPE.GA:
        observables.push(this.googleAnalyticsService.getData(GaChartParams.users));
        observables.push(this.googleAnalyticsService.getData(GaChartParams.sessions));
        observables.push(this.googleAnalyticsService.getData(GaChartParams.bounceRate));
        observables.push(this.googleAnalyticsService.getData(GaChartParams.avgSessionDuration));
        break;
      case D_TYPE.IG:
        pageID = pageIDs[D_TYPE.IG];
        observables.push(this.instagramService.getBusinessInfo(pageID));
        observables.push(this.instagramService.getMedia(pageID));
        observables.push(this.instagramService.getData(IgChartParams.profile_views, pageID));
        observables.push(this.instagramService.getData(IgChartParams.impressions, pageID));
        break;
      case D_TYPE.YT:
        observables.push(this.youtubeService.getData('info', pageIDs)); // todo to finish
        observables.push(this.youtubeService.getData('views', pageIDs));
        observables.push(this.youtubeService.getData('averageViewDuration', pageIDs));
        observables.push(this.youtubeService.getData('videos', pageIDs));
        break;
      case D_TYPE.FBM:
        params = {domain: 'insights'};
        pageID = pageIDs[D_TYPE.FBM];
        observables.push(this.facebookMarketingService.getData(params, pageID));
        break;
      case D_TYPE.FBC:
        params = {domain: 'campaigns'};
        pageID = pageIDs[D_TYPE.FBC];
        observables.push(this.facebookCampaignsService.getData(params, pageID));
        break;
      case D_TYPE.CUSTOM:
        observables.push(permissions[D_TYPE.GA] ? this.googleAnalyticsService.getData(GaChartParams.users) : of({}));
        observables.push(
          permissions[D_TYPE.FB] && pageIDs[D_TYPE.FB] !== null
            ? this.facebookService.getData('page_fans', pageIDs[D_TYPE.FB])
            : of({})
        );
        observables.push(
          permissions[D_TYPE.IG] && pageIDs[D_TYPE.IG] !== null
            ? this.instagramService.getBusinessInfo(pageIDs[D_TYPE.IG])
            : of({})
        );
        observables.push(
          permissions[D_TYPE.YT] && pageIDs[D_TYPE.YT] !== null
            ? this.youtubeService.getData('info', pageIDs[D_TYPE.YT])
            : of({})
        );
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
      case D_TYPE.YT :
        result = this.getYTMiniValue(measure, data);
        break;
      case D_TYPE.FBM :
        result = this.getFacebookMarketingMiniValue(measure, data, intervalDate);
        break;
      case D_TYPE.FBC :
        result = this.getFacebookCampaignsMiniValue(measure, data);
        break;
      case D_TYPE.CUSTOM:
        result = this.getCustomMiniValue(measure, data, intervalDate);
        break;
    }

    return result;
  }

  private getGoogleMiniValue(measure, data) {
    let value, sum = 0, avg, perc, step;
    let date = new Date();
    const y = date.getFullYear();
    const m = date.getMonth();

    const intervalDate: IntervalDate = {
      first: new Date(y, m, 1),
      last: new Date(new Date(y, m + 1, 0).setHours(23, 59, 59, 999))
    };

    data = data.filter(el => parseDate(el[0]).getTime() >= intervalDate.first.getTime() &&
      parseDate(el[0]).getTime() <= intervalDate.last.getTime()
    );

    for (const el of data) {
      sum += parseInt(el[1], 10);
    }

    data.length > 0 ? avg = (sum / data.length).toFixed(2) : avg = 0;

    switch (measure) {
      case 'bounce-rate':
        value = avg;
        step = this.searchStep(value, measure);
        perc = value;
        break;

      case 'time':
        date = new Date(null);
        date.setSeconds(parseInt(avg, 10)); // specify value for SECONDS here
        value = date.toISOString().substr(11, 8);
        step = this.searchStep(avg, measure);

        perc = parseInt(avg, 10) / step * 100;

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

  private getYTMiniValue(measure, data) {
    let value, sum = 0, perc, step, key;
    const date = new Date(), y = date.getFullYear(), m = date.getMonth();

    const intervalDate: IntervalDate = {
      first: new Date(y, m, 1),
      last: new Date(new Date(y, m + 1, 0).setHours(23, 59, 59, 999))
    };

    if (measure !== 'subs') {
      key = measure === 'n_videos' ? 'publishedAt' : 'date'; //  The key for the filter using the date is different for n_videos
      data = data.filter(el => parseDate(el[key]).getTime() >= intervalDate.first.getTime()
        && parseDate(el[key]).getTime() <= intervalDate.last.getTime()
      );
    }

    switch (measure) {
      case 'subs':
        value = data[0].subscribers;
        break;
      case 'views':
        value = data.map(el => el.value).reduce((a, b) => a + b, 0);
        break;
      case 'avg_view_time':
        sum = data.map(el => el.value).reduce((a, b) => a + b, 0);
        data.length > 0 ? value = (sum / data.length).toFixed(2) : value = 0 ;

        break;
      case 'n_videos':
        value = data.length;
        break;
    }

    step = this.searchStep(value, measure);
    perc = measure === 'subs' ? value : (value / step * 100);

    return {value, perc, step};
  }

  private getFacebookMiniValue(measure, data, intervalDate) {
    let value, perc, sum = 0, avg, max, aux, step;
    // console.log(intervalDate)
    switch (measure) {
      case 'post-sum':
        data['data'] = data['data'].filter(el => (moment(el['created_time'])) >= intervalDate.first && (moment(el['created_time'])) <= intervalDate.last);

        data['data'].length > 0 ? value = data['data'].length : value = 0 ;

        break; // The value is the number of post of the previous month, the perc is calculated considering the last 100 posts
      case 'count':
        // console.log(intervalDate.last);
        //console.log(data);
        data = data.filter(el => (moment(el.end_time)) >= intervalDate.first && (moment(el.end_time)) <= intervalDate.last);
        data.length > 0 ?  value = data[data.length - 1].value : value = 0;

        break; // The value is the last fan count, the perc is the value divided for the max fan count had in the last 2 years
      case 'reactions':
        data = data.filter(el => (new Date(el.end_time)) >= intervalDate.first && (new Date(el.end_time)) <= intervalDate.last);
        max = [];
        if (data.length > 0 ) {
          for (const i in data) {
            aux = 0;
            if (data[i]['value']) {
              aux += data[i]['value']['like'] || 0;
              aux += data[i]['value']['love'] || 0;
              aux += data[i]['value']['haha'] || 0;
              aux += data[i]['value']['wow'] || 0;
              aux += data[i]['value']['sorry'] || 0;
              aux += data[i]['value']['anger'] || 0;
            }
            sum += aux;
            max.push(aux);
          }

          avg = sum / data.length;
          value = sum;
        } else {
          avg = 0;
          value = 0;
        }

        break; // The value is the sum of all the reactions of the previous month, the perc is calculated dividing the average reactions for the max value
      default:
        data = data.filter(el => (moment(el.end_time)) >= intervalDate.first && (moment(el.end_time)) <= intervalDate.last);
        aux = 0;
        for (const i in data) {
          if (data[i]['value']) {
            aux += data[i]['value'] || 0;
          }
        }
        // value = data[data.length - 1].value;
        value = aux;
        break; // default take the last value as the good one, the perc is calculated dividing the avg for the max value
    }

    step = this.searchStep(value);
    perc = value / step * 100;

    return {value, perc, step};
  }

  private getFacebookMarketingMiniValue(measure, data, intervalDate) {
    let value = 0, perc, step;
    data = data.filter(el => parseDate(el.date_stop).getTime() >= intervalDate.first.getTime() && parseDate(el.date_stop).getTime() <= intervalDate.last.getTime());

    switch (measure) {
      case 'reach':
        data.forEach(d => value += parseInt(d.reach, 10));
        break;
      case 'spend':
        data.forEach(d => value += parseInt(d.spend, 10));
        break;
      case 'click':
        data.forEach(d => value += parseInt(d.clicks, 10));
        break;
      case 'impressions':
        data.forEach(d => value += parseInt(d.impressions, 10));
        break;
      default:
        data.forEach(d => value += parseInt(d.reach, 10));
        break;
    }

    step = this.searchStep(value);
    perc = value / step * 100;

    return {value, perc, step};
  }

  private getFacebookCampaignsMiniValue(measure, data) {
    let value, support = 0, perc, step, media = 0, value2;
    const supportArray = [];
    data.forEach(d =>
      d['insights'] !== null && d['insights'] !== undefined
        ? supportArray.push(Object.assign({}, d, d['insights'].data[0]))
        : supportArray.push(d)
    );
    switch (measure) {
      case 'budget':
        media = supportArray.filter(d => d.effective_status === 'ACTIVE').length;
        supportArray.forEach(d => d.daily_budget ? support += parseInt(d.daily_budget, 10) : null);
        value2 = Number(support / media).toFixed(2);
        value = value2 + ' €';
        break;
      case 'campaigns_status':
        value = supportArray.filter(d => d.effective_status === 'ACTIVE').length.toString();
        value2 = value;
        break;
      case 'spend':
        supportArray.forEach(d => d.spend ? (media++, support += parseInt(d.spend, 10)) : (media++, support += 0) );
        value2 = Number(support / media).toFixed(2);
        value = value2 + ' €';
        break;
      case 'reach':
        supportArray.forEach(d => d.reach ? (media++, support += parseInt(d.reach, 10)) : (media++, support += 0) );
        value = Math.round(support / media).toString();
        value2 = value;
        break;
      default:
        value = supportArray.filter(d => d.effective_status === 'ACTIVE').length.toString();
        value2 = value;
        break;
    }

    step = this.searchStep(value2);
    perc = value2 / step * 100;

    return {value, perc, step};
  }

  private getInstagramMiniValue(measure, data, intervalDate) {
    let value, perc, sum = 0, step;

    switch (measure) {
      case 'count':
        value = data[data.length - 1]['followers_count'];
        break; // The value is the last fan count, the perc is the value divided for the max fan count had in the last 2 years
      case 'post-sum':
        data = data.filter(el => (new Date(moment(el.timestamp).toDate())) >= intervalDate.first && (new Date(moment(el.timestamp).toDate())) );
        value = data.length;
        break;
      default:
        data = data.filter(el => (new Date(moment(el.end_time).toDate())) >= intervalDate.first && (new Date(moment(el.end_time).toDate())) <= intervalDate.last);
        for (const el of data) {
          sum += el.value;
        }
        value = sum;

        break; // The value is the sum of all the reactions of the previous month, the perc is calculated dividing the average reactions for the max value
    }

    step = this.searchStep(value);
    perc = value / step * 100;

    return {value, perc, step};
  }

  private getCustomMiniValue(measure, data, intervalDate) {
    let value, perc, step;

    switch (measure) {
      case 'fb-fan-count':
        data = data.filter(el => (moment(el.end_time)) >= intervalDate.first && (moment(el.end_time)) <= intervalDate.last);
        data.length > 0 ? value = data[data.length - 1].value : value = 0;

        break;
      case 'ig-follower':
        data.length > 0 ? value = data[data.length - 1]['followers_count'] : value = 0;
        break;
      case 'ga-tot-user':
        value = 0;
        data = data.filter(el => parseDate(el[0]).getTime() >= intervalDate.first.getTime() && parseDate(el[0]).getTime() <= intervalDate.last.getTime());
        for (const i in data) {
          value += parseInt(data[i][1]);
        }
        break;
      case 'subs':
        data = data.filter(el => parseDate(el.date).getTime() >= intervalDate.first.getTime() && parseDate(el.date).getTime() <= intervalDate.last.getTime());
        data.length > 0 ? value = data[0].subscribers : value = 0;
        break;
    }

    step = this.searchStep(value);
    perc = value / step * 100;

    return {value, perc, step};
  }

  private searchStep(value, measure?) {
    const nextStep = [10, 25, 50, 250, 500, 1000, 2000, 3000, 5000, 10000, 15000, 20000, 30000, 40000, 50000, 100000, 350000, 500000];
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

  private getDomain(arg: string) {
    let domain;

    if (arg.indexOf('://') > -1) {
      domain = arg.split('/')[2];
    } else {
      domain = arg.split('/')[0];
    }

    // trova e rimuovi eventuale porta
    domain = domain.split(':')[0];

    domain = domain.replace(/\$/g, '.');

    return domain;
  }

  public mapChartData(data) {

    const myMap = new Map();
    const chartData = [];

    for (const el of data) {
      if (el['value']) {
        const web = el['value'];

        for (let i in web) {
          // i = this.getDomain(i);
          const value = parseInt(web[i], 10);

          i = this.getDomain(i);
          if (myMap.has(i)) {
            myMap.set(i, myMap.get(i) + value);
          } else {
            myMap.set(i, value);
          }
        }
      }
    }

    const key = myMap.keys();
    const values = myMap.values();

    for (let i = 0; i < myMap.size; i++) {
      chartData.push([key.next().value, values.next().value]);
    }

    return chartData;
  }

  public lengthKeys(data) {
    let myMap;
    myMap = new Map();
    const keys = [];

    for (const el of data) {
      const n = el['value'];
      for (const key in n) {
        if (myMap.has(key)) {
          myMap.set(key, 0);
        } else {
          myMap.set(key, 0);
        }
      }
    }

    const key = myMap.keys();

    for (let i = 0; i < myMap.size; i++) {
      keys.push([key.next().value]);
    }

    return keys.length;
  }

  public formatTable(data, marketing, otherData?) { // format data that api return
    let supportArray = [];
    if (marketing) {
      data.data.forEach(d =>
        d['insights'] !== null && d['insights'] !== undefined
          ? supportArray.push(Object.assign({}, d, d['insights'].data[0]))
          : otherData != null ? otherData.push(d) : null
      );
    } else {
      supportArray = data.data;
    }
    return supportArray;
  }

  private formatDataFbm(data, breaks, breaks2?) {
    const array = [];
    let temp;

    data.forEach(d => array.find(el => el[breaks] === d[breaks] && el[breaks2] === d[breaks2]) !== undefined
      ? (
        temp = array.find(el => el[breaks] === d[breaks] && el[breaks2] === d[breaks2]),
          temp.reach = parseInt(temp.reach, 10) + parseInt(d.reach, 10),
          temp.impressions = parseInt(temp.impressions, 10) + parseInt(d.impressions, 10),
          temp.clicks = parseInt(temp.clicks, 10) + parseInt(d.clicks, 10),
          d.cpc ? temp.cpc = temp.cpc + parseFloat(Number(d.cpc).toPrecision(2)) : 0,
          d.cpp ? temp.cpp = temp.cpp + parseFloat(Number(d.cpp).toPrecision(2)) : 0,
          d.ctr ? temp.ctr = temp.ctr + parseFloat(Number(d.ctr).toPrecision(2)) : 0,
          temp.inline_link_clicks = parseInt(temp.inline_link_clicks, 10) + parseInt(d.inline_link_clicks, 10),
          temp.spend = parseFloat(temp.spend) + parseFloat(Number(d.spend).toPrecision(2)))
      : array.push({
        [breaks]: d[breaks],
        [breaks2]: d[breaks2],
        date_start: d.date_start,
        date_stop: d.date_stop,
        reach: parseInt(d.reach, 10),
        impressions: parseInt(d.impressions, 10),
        spend: parseFloat(d.spend).toFixed(2),
        cpc: parseFloat(d.cpc) ? parseFloat(Number(d.cpc).toPrecision(2)) : 0,
        cpp: parseFloat(d.cpp) ? parseFloat(Number(d.cpp).toPrecision(2)) : 0,
        ctr: parseFloat(d.ctr) ? parseFloat(Number(d.ctr).toPrecision(2)) : 0,
        clicks: parseInt(d.clicks, 10),
        inline_link_clicks: parseInt(d.inline_link_clicks, 10)
      })
    ); // TODO IMPROVE
    return array;
  }

  private changeNameCountry(data) {
    let chartData;
    const tmp = this.listCountry;

    chartData = Object.keys(data[data.length - 1].value).map(function (k) {
      return [ChartsCallsService.cutString(tmp.get(k), 30), data[data.length - 1].value[k]];
    });
    chartData.sort(function (obj1, obj2) {
      return obj2[1] > obj1[1] ? 1 : ((obj1[1] > obj2[1]) ? -1 : 0);
    });

    return chartData;
  }

  public checkControlDate (n, intervalDateComparison, data, flag) {
    let j = 0;
    let k = 0;

    /*
          Primo campo:
            1 = caso modifica intervalli
            2 = caso senza modifica intervalli

          Secondo campo: intervalDateComparison

          Terzo campo: data

          Quarto campo:
            0 = Restituire j
            1 = Restituire k
    */

    // Modifica intervalli
    if(n == 1) {
      for (let i = 0; i < data.length; i++) {
        //Controllo per colonna 1
        if ((parseDate(data[i]['end_time']) >= intervalDateComparison[0][0]) && parseDate(data[i]['end_time']) <= intervalDateComparison[0][1]) {
          j += data[i]['value'];
        }
        //Controllo per colonna 2
        if ((parseDate(data[i]['end_time']) >= intervalDateComparison[1][0]) && parseDate(data[i]['end_time']) <= intervalDateComparison[1][1]) {
          k += data[i]['value'];
        }
      }

      if (flag == 0) return j;
      if (flag == 1) return k;

    }

    // Non modifica intervalli
    if (n == 2) {

      for (let i = 0; i < data.length; i++) {

        // Se il filtro è impostato a "Ultimi 30 giorni"
        if (data.length == 30) {
          //Controllo per Colonna 1
          if ((parseDate(data[i]['end_time']) >= parseDate(data[data.length-15]['end_time'])) && (parseDate(data[i]['end_time']) <= parseDate(data[data.length-8]['end_time']))) {
            j += data[i]['value'];
          }
          //Controllo per colonna 2
          if ((parseDate(data[i]['end_time']) >= parseDate(data[data.length-8]['end_time'])) && (parseDate(data[i]['end_time']) <= parseDate(data[data.length-1]['end_time']))) {
            k += data[i]['value'];
          }
        }

        // Se il filtro è impostato a "Ultimi 7 giorni"
        if (data.length == 7) {
          //Controllo per Colonna 1
          if ((parseDate(data[i]['end_time']) >= parseDate(data[data.length-7]['end_time'])) && (parseDate(data[i]['end_time']) <= parseDate(data[data.length-5]['end_time']))) {
            j += data[i]['value'];
          }
          //Controllo per colonna 2
          if ((parseDate(data[i]['end_time']) >= parseDate(data[data.length-3]['end_time'])) && (parseDate(data[i]['end_time']) <= parseDate(data[data.length-1]['end_time']))) {
            k += data[i]['value'];
          }
        }

        // Se il filtro è impostato a "Personalizzato"
        if (data.length != 7 && data.length != 30) {

          // Se imposta la data di lunghezza 1 (es. 09/03 - 09/03)
          if (data.length == 1) {
            j = data[0]['value'];  //Controllo per Colonna 1
            k = data[0]['value']; //Controllo per colonna 2
          }

          // Se imposta la data di lunghezza 2 (es. 09/03 - 10/03)
          if (data.length == 2) {
            j = data[0]['value'];  //Controllo per Colonna 1
            k = data[1]['value'];  //Controllo per colonna 2
          }

          // Se imposta la data di lunghezza 3 (es. 09/03 - 11/03)
          if (data.length == 3) {
            j = data[0]['value'];  //Controllo per Colonna 1
            k = data[2]['value'];  //Controllo per colonna 2
          }

          // Se imposta la data di lunghezza >= 4 (es. 09/03 - 12/03)
          if (data.length >= 4) {
            //Controllo per Colonna 1
            if ((parseDate(data[i]['end_time']) >= parseDate(data[0]['end_time'])) && (parseDate(data[i]['end_time']) <= parseDate(data[1]['end_time']))) {
              j += data[i]['value'];
            }
            //Controllo per colonna 2
            if ((parseDate(data[i]['end_time']) >= parseDate(data[data.length-2]['end_time'])) && (parseDate(data[i]['end_time']) <= parseDate(data[data.length-1]['end_time']))) {
              k += data[i]['value'];
            }
          }

        }
      }

      if (flag == 0) return j;
      if (flag == 1) return k;

    }

  }

  public formatInterval (intervalDate, n: number, data) {

    if (!intervalDate) {
      if (data.length == 30) {
        if (n == 1) return parseDate(data[data.length-15]['end_time']).getDate() + '/' + (parseDate(data[data.length-15]['end_time']).getMonth()+1) + ' - ' + parseDate(data[data.length-8]['end_time']).getDate() + '/' + (parseDate(data[data.length-8]['end_time']).getMonth()+1);
        if (n == 2) return parseDate(data[data.length-8]['end_time']).getDate() + '/' + (parseDate(data[data.length-8]['end_time']).getMonth()+1) + ' - ' + parseDate(data[data.length-1]['end_time']).getDate() + '/' + (parseDate(data[data.length-1]['end_time']).getMonth()+1);
      } else {
        if (data.length == 7) {
          if (n == 1) return parseDate(data[data.length-7]['end_time']).getDate() + '/' + (parseDate(data[data.length-7]['end_time']).getMonth()+1) + ' - ' + parseDate(data[data.length-5]['end_time']).getDate() + '/' + (parseDate(data[data.length-5]['end_time']).getMonth()+1);
          if (n == 2) return parseDate(data[data.length-3]['end_time']).getDate() + '/' + (parseDate(data[data.length-3]['end_time']).getMonth()+1) + ' - ' + parseDate(data[data.length-1]['end_time']).getDate() + '/' + (parseDate(data[data.length-1]['end_time']).getMonth()+1);
        } else {

          // Se imposta la data di lunghezza 1 (es. 09/03 - 09/03)
          if (data.length == 1) {
            if (n == 1) return parseDate(data[0]['end_time']).getDate() + '/' + (parseDate(data[0]['end_time']).getMonth()+1) + ' - ' + parseDate(data[0]['end_time']).getDate() + '/' + (parseDate(data[0]['end_time']).getMonth()+1);
            if (n == 2) return parseDate(data[0]['end_time']).getDate() + '/' + (parseDate(data[0]['end_time']).getMonth()+1) + ' - ' + parseDate(data[0]['end_time']).getDate() + '/' + (parseDate(data[0]['end_time']).getMonth()+1);
          }

          // Se imposta la data di lunghezza 2 (es. 09/03 - 10/03)
          if (data.length == 2) {
            if (n == 1) return parseDate(data[0]['end_time']).getDate() + '/' + (parseDate(data[0]['end_time']).getMonth()+1) + ' - ' + parseDate(data[1]['end_time']).getDate() + '/' + (parseDate(data[1]['end_time']).getMonth()+1);
            if (n == 2) return parseDate(data[0]['end_time']).getDate() + '/' + (parseDate(data[0]['end_time']).getMonth()+1) + ' - ' + parseDate(data[1]['end_time']).getDate() + '/' + (parseDate(data[1]['end_time']).getMonth()+1);
          }

          // Se imposta la data di lunghezza 3 (es. 09/03 - 11/03)
          if (data.length == 3) {
            if (n == 1) return parseDate(data[0]['end_time']).getDate() + '/' + (parseDate(data[0]['end_time']).getMonth()+1) + ' - ' + parseDate(data[0]['end_time']).getDate() + '/' + (parseDate(data[0]['end_time']).getMonth()+1);
            if (n == 2) return parseDate(data[2]['end_time']).getDate() + '/' + (parseDate(data[2]['end_time']).getMonth()+1) + ' - ' + parseDate(data[2]['end_time']).getDate() + '/' + (parseDate(data[2]['end_time']).getMonth()+1);
          }

          // Se imposta la data di lunghezza >= 4 (es. 09/03 - 12/03)
          if (data.length >= 4) {
            if (n == 1) return parseDate(data[0]['end_time']).getDate() + '/' +  (parseDate(data[0]['end_time']).getMonth()+1) + ' - ' + parseDate(data[1]['end_time']).getDate() + '/' + (parseDate(data[1]['end_time']).getMonth()+1);
            if (n == 2) return parseDate(data[data.length-2]['end_time']).getDate() + '/' + (parseDate(data[data.length-2]['end_time']).getMonth()+1) + ' - ' + parseDate(data[data.length-1]['end_time']).getDate() + '/' + (parseDate(data[data.length-1]['end_time']).getMonth()+1);
          }

        }
      }
    } else {
      /*  DIFFERENZE
      Il primo If commentato restituisce il giorno nel formato '0d'; es: 04/12
      Il secondo If (quello non commentato) restituisce il giorno nel formato 'd'; es: 4/12
       */
      //if (n == 1) return parseDate(intervalDate[0][0]).toDateString().slice(8, -5) + '/' +  parseDate(intervalDate[0][0]).getMonth() + ' - ' + parseDate(intervalDate[0][1]).toDateString().slice(8, -5) + '/' +  parseDate(intervalDate[0][1]).getMonth();
      if (n == 1) return parseDate(intervalDate[0][0]).getDate() + '/' + (parseDate(intervalDate[0][0]).getMonth()+1) + ' - ' + parseDate(intervalDate[0][1]).getDate() + '/' + (parseDate(intervalDate[0][1]).getMonth()+1);
      if (n == 2) return parseDate(intervalDate[1][0]).getDate() + '/' + (parseDate(intervalDate[1][0]).getMonth()+1) + ' - ' + parseDate(intervalDate[1][1]).getDate() + '/' + (parseDate(intervalDate[1][1]).getMonth()+1);
    }
  }

  private areaChart(data, format?: object) {
    let formattedData;
    formattedData = {
      chartType: 'AreaChart',
      dataTable: data,
      formatters: [{ columns: [1],  type: 'NumberFormat', options: { pattern: '#.##' } }],

      options: {
        chartArea: {left: 0, right: 0, height: 192, top: 0},
        legend: {position: 'none'},
        lineWidth: data.length > 15 ? (data.length > 40 ? 2 : 3) : 4,
        height: 210,
        pointSize: data.length > 15 ? 0 : 7,
        pointShape: 'circle',
        hAxis: {gridlines: {color: 'transparent'}, textStyle: {color: '#999', fontName: 'Roboto'}, minTextSpacing: 15},
        vAxis: {
          gridlines: {color: '#eaeaea', count: 5},
          minorGridlines: {color: 'transparent'},
          minValue: 0,
          textPosition: 'in',
          textStyle: {color: '#999'},
          format: '##.##'
        },
        areaOpacity: 0.1
      }
    };

    if (format) {
      for (const el of Object.keys(format)) {
        if (el !== 'options') {
          formattedData[el] = format[el];
        }
        if (el === 'options') {
          for (const e of Object.keys(format[el])) {
            if (formattedData[el][e]) {
              Object.assign(formattedData[el][e], format[el][e]);
            } else {
              formattedData[el][e] = format[el][e];
            }
          }
        }
      }
    }
    return formattedData;
  }

  private tableChart(data, format?: object) {

    let formattedData;

    formattedData = {
      chartType: 'Table',
      dataTable: data,
      formatters: [{ columns: [1],  type: 'NumberFormat', options: { pattern: '#.##' } }],
      options: {
        cssClassNames: {
          'headerRow': 'border m-3 headercellbg',
          'tableRow': 'bg-light',
          'oddTableRow': 'bg-white',
          'selectedTableRow': '',
          'hoverTableRow': '',
          'headerCell': 'border-0 py-2 pl-2',
          'tableCell': 'border-0 py-1 pl-2',
          'rowNumberCell': 'underline-blue-font',
        },
        alternatingRowStyle: true,
        allowHtml: true,
        sort: 'disable',
        sortColumn: 1,
        pageSize: 9,
        height: '100%',
        width: '100%'
      }
    };

    if (format) {
      for (const el of Object.keys(format)) {
        if (el !== 'options') {
          formattedData[el] = format[el];
        }
        if (el === 'options') {
          for (const e of Object.keys(format[el])) {
            if (formattedData[el][e]) {
              Object.assign(formattedData[el][e], format[el][e]);
            } else {
              formattedData[el][e] = format[el][e];
            }
          }
        }
      }
    }
    return formattedData;
  }

  private columnChart(data, format?: object) {

    let formattedData;

    formattedData = {
      chartType: 'ColumnChart',
      dataTable: data,
      formatters: [{ columns: [1],  type: 'NumberFormat', options: { pattern: '#.##' } }],
      options: {
        chartArea: {left: 0, right: 0, height: 290, top: 0},
        legend: {position: 'none'},
        height: 330,
        vAxis: {gridlines: {color: '#eaeaea', count: 6}, textPosition: 'in', textStyle: {color: '#999'}, format: '##.##'},
        areaOpacity: 0.4,
      }
    };

    if (format) {
      for (const el of Object.keys(format)) {
        if (el !== 'options') {
          formattedData[el] = format[el];
        }
        if (el === 'options') {
          for (const e of Object.keys(format[el])) {
            if (formattedData[el][e]) {
              Object.assign(formattedData[el][e], format[el][e]);
            } else {
              formattedData[el][e] = format[el][e];
            }
          }
        }
      }
    }

    return formattedData;
  }

  private pieChart(data, format?: object) {

    let formattedData;

    formattedData = {
      chartType: 'PieChart',
      dataTable: data,
      chartClass: 8,
      formatters: [{ columns: [1],  type: 'NumberFormat', options: { pattern: '#.##' } }],
      options: {
        chartArea: {left: 100, right: 0, height: 290, top: 20},
        legend: {position: 'right'},
        height: 310,
        is3D: false,
        pieHole: 0.55,
        pieSliceText: 'percentage',
        pieSliceTextStyle: {fontSize: 12, color: 'white'},
        areaOpacity: 0.2
      }
    };

    if (format) {
      for (const el of Object.keys(format)) {
        if (el !== 'options') {
          formattedData[el] = format[el];
        }
        if (el === 'options') {
          for (const e of Object.keys(format[el])) {
            if (formattedData[el][e]) {
              Object.assign(formattedData[el][e], format[el][e]);
            } else {
              formattedData[el][e] = format[el][e];
            }
          }
        }
      }
    }

    return formattedData;
  }

  private geoChart(data, format?: object) {

    let formattedData;

    formattedData = {
      chartType: 'GeoChart',
      dataTable: data,
      chartClass: 2,
      formatters: [{ columns: [1],  type: 'NumberFormat', options: { pattern: '#.##' } }],
      options: {
        legend: {numberFormat: '##.##'},
        colorAxis: {colors: ['#9EDEEF', '#63c2de']},
        backgroundColor: '#fff',
        datalessRegionColor: '#eee',
        defaultColor: '#333',
        height: '300',
        //magnifyingGlass: {enable: true, msContentZoomFactor: 7.5}
      }
    };

    if (format) {
      for (const el of Object.keys(format)) {
        if (el !== 'options') {
          formattedData[el] = format[el];
        }
        if (el === 'options') {
          for (const e of Object.keys(format[el])) {
            if (formattedData[el][e]) {
              Object.assign(formattedData[el][e], format[el][e]);
            } else {
              formattedData[el][e] = format[el][e];
            }
          }
        }
      }
    }

    return formattedData;
  }

}
