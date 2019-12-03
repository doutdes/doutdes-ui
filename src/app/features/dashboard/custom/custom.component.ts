import {Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {GoogleAnalyticsService} from '../../../shared/_services/googleAnalytics.service';
import {DashboardCharts} from '../../../shared/_models/DashboardCharts';
import {DashboardService} from '../../../shared/_services/dashboard.service';
import {ChartsCallsService} from '../../../shared/_services/charts_calls.service';
import {GlobalEventsManagerService} from '../../../shared/_services/global-event-manager.service';
import {FilterActions} from '../redux-filter/filter.actions';
import {select} from '@angular-redux/store';
import {forkJoin, Observable} from 'rxjs';
import {DashboardData, IntervalDate} from '../redux-filter/filter.model';
import {subDays} from 'date-fns';
import {ngxLoadingAnimationTypes} from 'ngx-loading';
import {FacebookService} from '../../../shared/_services/facebook.service';
import {InstagramService} from '../../../shared/_services/instagram.service';
import {YoutubeService} from '../../../shared/_services/youtube.service';
import {D_TYPE, DS_TYPE} from '../../../shared/_models/Dashboard';
import {ApiKeysService} from '../../../shared/_services/apikeys.service';
import {ToastrService} from 'ngx-toastr';
import {ApiKey} from '../../../shared/_models/ApiKeys';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BsLocaleService, BsModalRef, BsModalService, parseDate} from 'ngx-bootstrap';
import {CustomMiniCards, MiniCard} from '../../../shared/_models/MiniCard';

import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {User} from '../../../shared/_models/User';
import {UserService} from '../../../shared/_services/user.service';
import * as _ from 'lodash';
import {DragulaService} from 'ng2-dragula';
import {ChartParams} from '../../../shared/_models/Chart';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';

const PrimaryWhite = '#ffffff';

@Component({
  selector: 'app-feature-dashboard-custom',
  templateUrl: './custom.component.html'
})

export class FeatureDashboardCustomComponent implements OnInit, OnDestroy {

  @ViewChild('selectView') selectView;
  @ViewChild('selectViewFb') selectViewFb;
  @ViewChild('reportWait') reportWait;

  public HARD_DASH_DATA = {
    dashboard_type: D_TYPE.CUSTOM,
    dashboard_id: null,
    permissions: null
  };

  D_TYPE = D_TYPE;
  private fbPageID = null;
  private igPageID = null;
  private ytPageID = null;
  public somethingGranted = true;

  public FILTER_DAYS = {
    yesterday: 1,
    seven: 6,
    thirty: 29,
    ninety: 89
  };

  public chartArray$: Array<DashboardCharts> = [];
  public miniCards: MiniCard[] = CustomMiniCards;
  private dashStored: Array<DashboardCharts> = [];
  public tmpArray: Array<DashboardCharts> = [];

  loaded = false;
  public loading = false;
  public config = {
    animationType: ngxLoadingAnimationTypes.threeBounce,
    backdropBackgroundColour: 'rgba(0,0,0,0.1)',
    backdropBorderRadius: '4px',
    primaryColour: PrimaryWhite,
    secondaryColour: PrimaryWhite
  };

  @select() filter: Observable<any>;

  firstDateRange: Date;
  lastDateRange: Date;
  maxDate: Date = subDays(new Date(), this.FILTER_DAYS.yesterday);
  minDate: Date = subDays(this.maxDate, this.FILTER_DAYS.ninety);
  minSet: Array<{ id: number; minDate: Date }> = [];   // contains the minimum Date for every chart, used to refresh datepicker on the fly
  bsRangeValue: Date[];
  dateChoice: String = null;
  modalRef: BsModalRef;

  // Form for init
  selectViewForm: FormGroup;
  selectViewFormFb: FormGroup;
  loadingForm: boolean;
  submitted: boolean;
  viewList;
  fbPageList;

  drag: boolean;

  lang: string;
  value: string;
  tmp: string;
  user: User;

  constructor(
    private GAService: GoogleAnalyticsService,
    private FBService: FacebookService,
    private IGService: InstagramService,
    private YTService: YoutubeService,
    private breadcrumbActions: BreadcrumbActions,
    private DService: DashboardService,
    private CCService: ChartsCallsService,
    private GEService: GlobalEventsManagerService,
    private filterActions: FilterActions,
    private apiKeyService: ApiKeysService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private dragulaService: DragulaService,
    public translate: TranslateService,
    private http: HttpClient
  ) {
    this.dragulaService.createGroup('REVERT', {
      revertOnSpill: false,
    });

    this.userService.get().subscribe(value => {
      this.user = value;

      this.http.get("./assets/langSetting/langToastr/" + this.conversionSetDefaultLang() + ".json")
        .subscribe(file => {
          this.GEService.langObj.next(file);
        }, error => {
          console.error(error);
        });

      if (this.GEService.getStringFilterDate('FILTER_DATE', 'LAST_30') == null) {
        this.http.get('./assets/langSetting/langStringVarious/' + this.conversionSetDefaultLang() + '.json')
          .subscribe(file => {
            this.GEService.langFilterDate.next(file);
            this.dateChoice = this.GEService.getStringFilterDate('FILTER_DATE', 'LAST_30');
          });

      } else {
        this.dateChoice = this.GEService.getStringFilterDate('FILTER_DATE', 'LAST_30');
      }
    });
  }

  async ngOnInit() {
    let existence, view_id;
    let igPages, ytChannels;
    let key: ApiKey;

    this.GEService.loadingScreen.subscribe(value => {
      this.loading = value;
    });
    this.minSet.push({
      id: -1,
      minDate: subDays(this.maxDate, this.FILTER_DAYS.ninety)
    });
    this.addBreadcrumb();
    this.GEService.loadingScreen.next(true);

    try {
      existence = await this.checkExistence();

      if (!existence.somethingGranted) {
        this.somethingGranted = false;
        this.GEService.loadingScreen.next(false);
        return;
      }

      this.HARD_DASH_DATA.permissions = existence.permissions;

      if (this.HARD_DASH_DATA.permissions[D_TYPE.GA]) {

        view_id = await this.getViewID();

        // We check if the user has already set a preferred GOOGLE page if there is more than one in his permissions.
        if (!view_id) {
          await this.getViewList();

          if (this.viewList.length === 1) {
            key = {ga_view_id: this.viewList[0]['id'], service_id: D_TYPE.GA};
            await this.apiKeyService.updateKey(key).toPromise();

          } else {
            this.selectViewForm = this.formBuilder.group({
              view_id: ['', Validators.compose([Validators.maxLength(15), Validators.required])],
            });

            this.selectViewForm.controls['view_id'].setValue(this.viewList[0].id);
            this.GEService.loadingScreen.next(false);
            this.openModal(this.selectView, true);

            return;
          }
        }
      }
      if (this.HARD_DASH_DATA.permissions[D_TYPE.FB]) {

        this.fbPageID = await this.getFbPageID();

        if (!this.fbPageID) {
          await this.getFbPagesList();
          if (this.fbPageList.length === 1) {
            key = {fb_page_id: this.fbPageList[0]['id'], service_id: D_TYPE.FB};
            await this.apiKeyService.updateKey(key).toPromise();
          } else {
            this.selectViewFormFb = this.formBuilder.group({
              fb_page_id: ['', Validators.compose([Validators.maxLength(20), Validators.required])],
            });
            this.selectViewFormFb.controls['fb_page_id'].setValue(this.fbPageList[0].id);
            this.GEService.loadingScreen.next(false);
            this.openModal(this.selectViewFb, true);

            return;
          }
        }
      }

      // Retrieving the pages ID // TODO to add the choice of the page, now it takes just the first one
      //this.fbPageID = this.HARD_DASH_DATA.permissions[D_TYPE.FB] ? (await this.getFbPageID()) : null;
      this.igPageID = this.HARD_DASH_DATA.permissions[D_TYPE.IG] ? (await this.IGService.getPages().toPromise()) : null;
      this.ytPageID = this.HARD_DASH_DATA.permissions[D_TYPE.YT] ? (await this.YTService.getChannels().toPromise()) : null;

      this.firstDateRange = subDays(new Date(), 30); // this.minDate;
      this.lastDateRange = this.maxDate;
      // this.bsRangeValue = [this.firstDateRange, this.lastDateRange];
      this.bsRangeValue = [subDays(new Date(), 30), this.lastDateRange]; // Starts with Last 30 days

      this.filter.subscribe(elements => {
        this.chartArray$ = elements['filteredDashboard'] ? elements['filteredDashboard']['data'] : [];
        const index = elements['storedDashboards'] ? elements['storedDashboards'].findIndex((el: DashboardData) => el.type === D_TYPE.CUSTOM) : -1;
        this.dashStored = index >= 0 ? elements['storedDashboards'][index] : null;
      });

      const dash_type = this.HARD_DASH_DATA.dashboard_type;

      if (!this.GEService.isSubscriber(dash_type)) {
        this.GEService.removeFromDashboard.subscribe(values => {
          if (values[0] !== 0 && values[1] === this.HARD_DASH_DATA.dashboard_id) {

            this.minSet = this.minSet.filter(el => el.id !== values[0]);
            this.filterActions.removeChart(values[0]);
          }
        });
        this.GEService.showChartInDashboard.subscribe(chart => {
          if (chart && chart.dashboard_id === this.HARD_DASH_DATA.dashboard_id) {
            this.addChartToDashboard(chart);
          }
        });
        this.GEService.updateChartInDashboard.subscribe(chart => {
          if (chart && chart.dashboard_id === this.HARD_DASH_DATA.dashboard_id) {
            this.filterActions.updateChart(chart);
          }
        });

        this.GEService.addSubscriber(dash_type);
      }

      await this.loadMiniCards();
      await this.loadDashboard();
      this.GEService.loadingScreen.next(false);

    } catch (e) {
      console.error('Error on ngOnInit of Custom Dashboard', e);
      this.toastr.error('È stato riscontrato un errore durante il carimento della dashboard. Per favore, riprova oppure contatta il supporto.', 'Errore nel carimento della dashboard');
    }


  }

  async loadDashboard() {
    let chartParams: ChartParams = {};
    const observables: Observable<any>[] = [];
    const chartsToShow: Array<DashboardCharts> = [];
    const dateInterval: IntervalDate = {
      first: this.minDate,
      last: this.maxDate
    };
    let currentData: DashboardData = {
      data: chartsToShow,
      interval: dateInterval,
      type: D_TYPE.CUSTOM,
    };

    let pageID, dash, charts, dataArray;

    this.dragulaService.find('REVERT');

    try {
      // Retrieving dashboard ID
      dash = await this.DService.getDashboardByType(D_TYPE.CUSTOM).toPromise(); // Custom dashboard type

      if (dash['id']) {
        this.HARD_DASH_DATA.dashboard_id = dash['id']; // Retrieving dashboard id
      } else {
        //this.toastr.error('Non è stato possibile recuperare la dashboard. Per favore, contatta il supporto.', 'Errore durante l\'inizializzazione della dashboard.');

        this.toastr.error(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'NO_INIZ'),
          this.GEService.getStringToastr(true, false, 'DASHBOARD', 'NO_INIZ'));
        return;
      }

      if (this.dashStored) {
        // Ci sono già dati salvati
        this.filterActions.loadStoredDashboard(D_TYPE.CUSTOM);
        this.bsRangeValue = [subDays(this.maxDate, this.FILTER_DAYS.thirty), this.lastDateRange];
        this.GEService.loadingScreen.next(false);

        if (this.chartArray$.length === 0) {
          //this.toastr.info('Puoi iniziare aggiungendo un nuovo grafico.', 'La tua dashboard è vuota');

          this.toastr.info(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'VUOTA'),
            this.GEService.getStringToastr(true, false, 'DASHBOARD', 'VUOTA'));
        }
      } else {
        charts = await this.DService.getAllDashboardCharts(this.HARD_DASH_DATA.dashboard_id).toPromise();

        if (charts && charts.length > 0) { // Checking if dashboard is not empty
          charts.forEach((chart: DashboardCharts) => {
            chartParams = {};
            // If the permission for the service is granted
            if (this.HARD_DASH_DATA.permissions[chart.type] === true) {
              chartParams = {
                metric: chart.metric,
                dimensions: chart.dimensions || null,
                sort: chart.sort || null,
                interval: chart.interval || null,
                period: chart.period || null,
                filter: chart.filter || null
              };

              pageID = this.getPageID(chart.type);
              if (chart.type === D_TYPE.IG) {
                console.log(pageID);
              }
              observables.push(this.CCService.retrieveChartData(chart.type, chartParams, pageID));
            }
          }); // Retrieves data for each chart


          dataArray = await forkJoin(observables).toPromise();

          if (dataArray) {
            for (let i = 0; i < dataArray.length; i++) {

              const chart: DashboardCharts = charts[i];

              if (!dataArray[i].status && chart) { // If no error is occurred when retrieving chart data

                chart.chartData = dataArray[i];
                this.minDate = new Date(Math.min.apply(null, this.minSet));

                chart.error = false;
              } else {
                chart.error = true;

                console.error('ERROR in CUSTOM-COMPONENT. Cannot retrieve data from one of the charts. More info:');
                console.error(dataArray[i]);
              }

              chartsToShow.push(chart);
            }

            currentData = {
              data: chartsToShow,
              interval: dateInterval,
              type: D_TYPE.CUSTOM,
            };

            this.filterActions.initData(currentData);
            this.GEService.updateChartList.next(true);

            // Shows last 30 days
            this.bsRangeValue = [subDays(this.maxDate, this.FILTER_DAYS.thirty), this.lastDateRange];

            this.GEService.loadingScreen.next(false);
          }
        } else {
          this.filterActions.initData(currentData);
          this.GEService.loadingScreen.next(false);
          //this.toastr.info('Puoi iniziare aggiungendo un nuovo grafico.', 'La tua dashboard è vuota');

          this.toastr.info(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'VUOTA'),
            this.GEService.getStringToastr(true, false, 'DASHBOARD', 'VUOTA'));
        }
      }

      this.loaded = true;

    } catch (e) {
      console.error(e);
      this.toastr.error(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'NO_INIZ'),
        this.GEService.getStringToastr(true, false, 'DASHBOARD', 'NO_INIZ'));
    }
  }

  addChartToDashboard(dashChart: DashboardCharts) {
    const chartToPush: DashboardCharts = dashChart;
    const pageID = this.getPageID(dashChart.type);
    const dateInterval: IntervalDate = {
      first: this.bsRangeValue[0],
      last: this.bsRangeValue[1]
    };
    const chartParams: ChartParams = {
      metric: dashChart.metric,
      dimensions: dashChart.dimensions || null,
      sort: dashChart.sort || null,
      interval: dashChart.interval || null,
      period: dashChart.period || null,
      filter: dashChart.filter || null
    };


    this.CCService.retrieveChartData(dashChart.type, chartParams, pageID)
      .subscribe(chartData => {
        if (!chartData['status']) { // Se la chiamata non rende errori
          chartToPush.chartData = chartData;

          // getting the minDate of the chart, depending on its type
          switch (dashChart.type) {
            case D_TYPE.FB :
            case D_TYPE.IG:
              this.minSet.push({
                id: dashChart.chart_id,
                minDate: new Date(dashChart.chartData[0]['end_time'])
              });
              break;
            case D_TYPE.GA:
              this.minSet.push({
                id: dashChart.chart_id,
                minDate: (parseDate(dashChart['chartData'][0][0]))
              });
              break;
            case D_TYPE.YT:
              this.minSet.push({
                id: dashChart.chart_id,
                minDate: (parseDate(dashChart.chartData[0]['date']))
              });
              break;
          }
          this.minSet.forEach(el => {
            if (el.minDate < this.minDate) {
              this.minDate = el.minDate;
            }
          });

          chartToPush.error = false;

          const date = parseDate(chartToPush['chartData'][0][0]);
          if (date < this.minDate) {
            this.minDate = date;
          }

          //this.toastr.success('"' + dashChart.title + '" è stato correttamente aggiunto alla dashboard.', 'Grafico aggiunto!');

          this.toastr.success(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'ADD'),
            this.GEService.getStringToastr(true, false, 'DASHBOARD', 'ADD'));
        } else {
          chartToPush.error = true;
          console.log('Errore recuperando dati per ' + dashChart);

          // this.toastr.error('"' + dashChart.title + ' contiene dati che non potrebbero essere sufficienti', 'Errore durante l\'aggiunta del grafico');

          this.toastr.error('"' + dashChart.title + this.GEService.getStringToastr(false, true, 'DASHBOARD', 'NO_DATI'),
            this.GEService.getStringToastr(true, false, 'DASHBOARD', 'NO_DATI'));

        }
        this.filterActions.addChart(chartToPush);
        this.filterActions.filterData(dateInterval);
      }, error1 => {
        console.log('Error querying the Chart');
        console.log(error1);

        //this.toastr.error('"' + dashChart.title + ': C\'è stato un errore recuperando i dati per il grafico . Per favore, riprova più tardi oppure contatta il supporto.', 'Errore durante l\'aggiunta del grafico');

        this.toastr.error('"' + dashChart.title + this.GEService.getStringToastr(false, true, 'DASHBOARD', 'NO_DATI_1'),
          this.GEService.getStringToastr(true, false, 'DASHBOARD', 'NO_DATI_1'));
      });
  }

  onValueChange(value): void {
    if (value) {
      const dateInterval: IntervalDate = {
        first: new Date(value[0].setHours(0, 0, 0, 0)),
        last: new Date(value[1].setHours(23, 59, 59))
      };
      this.filterActions.filterData(dateInterval);

      const diff = Math.abs(dateInterval.first.getTime() - dateInterval.last.getTime());
      const diffDays = Math.ceil(diff / (1000 * 3600 * 24)) - 1;

      if (!Object.values(this.FILTER_DAYS).includes(diffDays)) {
        this.dateChoice = 'Personalizzato';
      }
    }
  }

  changeData(days: number) {
    this.bsRangeValue = [subDays(this.maxDate, days), this.lastDateRange];

    switch (days) {
      case this.FILTER_DAYS.seven:
        switch (this.user.lang) {
          case 'it':
            this.dateChoice = 'Ultimi 7 giorni';
            break;
          case 'en':
            this.dateChoice = 'Last 7 days';
            break;
          default:
            this.dateChoice = 'Ultimi 7 giorni';
        }
        break;
      case this.FILTER_DAYS.thirty:
        switch (this.user.lang) {
          case 'it':
            this.dateChoice = 'Ultimi 30 giorni';
            break;
          case 'en':
            this.dateChoice = 'Last 30 days';
            break;
          default:
            this.dateChoice = 'Ultimi 30 giorni';
        }
        break;
      case this.FILTER_DAYS.ninety:
        switch (this.user.lang) {
          case 'it':
            this.dateChoice = 'Ultimi 90 giorni';
            break;
          case 'en':
            this.dateChoice = 'Last 90 days';
            break;
          default:
            this.dateChoice = 'Ultimi 90 giorni';
        }
        break;
      default:
        switch (this.user.lang) {
          case 'it':
            this.dateChoice = 'Personalizzato';
            break;
          case 'en':
            this.dateChoice = 'Customized';
            break;
          default:
            this.dateChoice = 'Personalizzato';
        }
        break;
    }
  }

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Dashboard', '/dashboard/'));

    if (this.GEService.getStringBreadcrumb('SITO_WEB') == null) {

      this.userService.get().subscribe(value => {
        this.user = value;

        this.http.get('./assets/langSetting/langBreadcrumb/' + this.conversionSetDefaultLang() + '.json')
          .subscribe(file => {
            this.GEService.langBread.next(file);
            bread.push(new Breadcrumb(this.GEService.getStringBreadcrumb('SITO_WEB'), '/dashboard/google'));
          });
      });

    } else {
      bread.push(new Breadcrumb(this.GEService.getStringBreadcrumb('SITO_WEB'), '/dashboard/google'));
    }

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  ngOnDestroy() {
    this.removeBreadcrumb();
    this.filterActions.removeCurrent();

    this.dragulaService.destroy('REVERT');
  }

  nChartEven() {
    return this.chartArray$.length % 2 === 0;
  }

  getPageID(type: number) {
    let pageID;

    switch (type) { // TODO edit
      case D_TYPE.FB:
        pageID = this.fbPageID;
        break;
      case D_TYPE.IG:
        pageID = this.igPageID[0].id;
        break;
      case D_TYPE.YT:
        pageID = this.ytPageID[0].id;
        break;
      default:
        pageID = null;
        break;
    }

    return pageID;
  }

  async checkExistence() {
    const permissions = {};
    const keys = Object.keys(D_TYPE);
    let response, somethingGranted = false;

    try {
      for (const i in keys) {
        if (D_TYPE[keys[i]] !== D_TYPE.CUSTOM) {
          response = await this.apiKeyService.checkIfKeyExists(D_TYPE[keys[i]]).toPromise();
          permissions[D_TYPE[keys[i]]] = response['exists'] && (await this.apiKeyService.isPermissionGranted(D_TYPE[keys[i]]).toPromise())['granted'];
          somethingGranted = somethingGranted || permissions[D_TYPE[keys[i]]];
        }
      }
    } catch (e) {
      console.error(e);
    }

    return {
      permissions: permissions,
      somethingGranted: somethingGranted
    };
  }

  async loadMiniCards() {
    // 1. Init intervalData (retrieve data of previous month)
    let results, pageIDs = {};
    const permissions = this.HARD_DASH_DATA.permissions;
    const date = new Date(), y = date.getFullYear(), m = date.getMonth();

    const intervalDate: IntervalDate = {
      first: new Date(y, m, 1),
      last: new Date(new Date(y, m + 1, 0).setHours(23, 59, 59, 999))
    };

    pageIDs[D_TYPE.FB] = this.fbPageID;

    pageIDs[D_TYPE.IG] = (this.igPageID != undefined) ? this.igPageID[0].id : null; // TODO change this when the multiple choice works
    pageIDs[D_TYPE.YT] = (this.ytPageID != undefined) ? this.ytPageID[0].id: null; // TODO change this when the multiple choice works

    const observables = this.CCService.retrieveMiniChartData(D_TYPE.CUSTOM, pageIDs, intervalDate, permissions);

    forkJoin(observables).subscribe(miniDatas => {
      for (const i in miniDatas) {
        if (Object.keys(miniDatas[i]).length !== 0) {
          results = this.CCService.formatMiniChartData(miniDatas[i], D_TYPE.CUSTOM, this.miniCards[i].measure, intervalDate);
          this.getNameMinicard(i);
          this.miniCards[i].value = results['value'];
          this.miniCards[i].progress = results['perc'] + '%';
          this.miniCards[i].step = results['step'];
        } else {
          this.getNameMinicard(i);
          this.miniCards[i].value = '-';
          this.miniCards[i].progress = '0%';
          this.miniCards[i].step = 0;
        }
      }
    });
  }

  async getViewID() {
    let viewID;

    try {
      viewID = (await this.apiKeyService.getAllKeys().toPromise()).ga_view_id;
    } catch (e) {
      console.error('getViewID -> error doing the query', e);
    }

    return viewID;
  }

  async getViewList() {
    try {
      this.viewList = await this.GAService.getViewList().toPromise();
    } catch (e) {
      console.error('getViewList -> Error doing the query');
    }
  }

  async selectViewSubmit(service_id: number) {
    let update, key: ApiKey;
    this.submitted = true;

    switch (service_id) {
      case D_TYPE.GA:
        if (this.selectViewForm.invalid) {
          this.loadingForm = false;
          return;
        }
        key = {
          ga_view_id: this.selectViewForm.value.view_id,
          service_id: D_TYPE.GA
        };
        break;
      case D_TYPE.FB:
        if (this.selectViewFormFb.invalid) {
          this.loadingForm = false;
          return;
        }
        key = {
          fb_page_id: this.selectViewFormFb.value.fb_page_id,
          service_id: D_TYPE.FB
        };
        break;
      default:
        break;
    }

    this.loadingForm = true;

    update = await this.apiKeyService.updateKey(key).toPromise();

    if (update) {
      this.closeModal();
      await this.ngOnInit();
    } else {
      this.toastr.error(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'ERR_AGG'),
        this.GEService.getStringToastr(true, false, 'DASHBOARD', 'ERR_AGG'));
    }
  }

  clearDashboard(): void {
    //console.log(charts_id);

    this.DService.clearDashboard(this.HARD_DASH_DATA.dashboard_id).subscribe(() => {
      this.filterActions.clearDashboard(D_TYPE.CUSTOM);
      this.closeModal();
    }, error => {
      if (error.status === 500) {
        this.toastr.error(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'NO_CLEAR'),
          this.GEService.getStringToastr(true, false, 'DASHBOARD', 'NO_CLEAR'));
        this.closeModal();
        console.error(error);
      } else {
        //console.error('ERROR in CARD-COMPONENT. Cannot delete a chart from the dashboard.');

        this.toastr.error(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'NO_RIMOZIONE'),
          this.GEService.getStringToastr(true, false, 'DASHBOARD', 'NO_RIMOZIONE'));
        console.error(error);
        this.closeModal();
      }
    });
  }

  async htmltoPDF() {
    const pdf = new jsPDF('p', 'px', 'a4');// 595w x 842h
    const cards = document.querySelectorAll('app-card');
    const firstCard = await html2canvas(cards[0]);

    const user = await this.getUserCompany();

    let dimRatio = firstCard['width'] > 400 ? 3 : 2;
    let graphsRow = 2;
    let graphsPage = firstCard['width'] > 400 ? 6 : 4;
    let x = 40, y = 40;
    let offset = y - 10;

    let dateObj = new Date(), month = dateObj.getUTCMonth() + 1, day = dateObj.getUTCDate(), year = dateObj.getUTCFullYear();

    this.openModal(this.reportWait, true);

    pdf.setFontSize(8);
    pdf.text(user.company_name, 320, offset);
    pdf.text('P. IVA: ' + user.vat_number, 320, offset + 10);
    pdf.text(user.first_name + ' ' + user.last_name, 320, offset + 20);
    pdf.text(user.address, 320, offset + 30);
    pdf.text(user.zip + ' - ' + user.city + ' (' + user.province + ')', 320, offset + 40);

    pdf.setFontSize(18);
    pdf.text('REPORT DASHBOARD PERSONALIZZATA', x, y - 5);
    y += 20;

    pdf.setFontSize(14);
    pdf.text('Periodo: ' + this.formatStringDate(this.bsRangeValue[0]) + ' - ' + this.formatStringDate(this.bsRangeValue[1]), x, y - 8);
    y += 40;

    // Numero grafici per riga dipendente da dimensioni grafico
    for (let i = 0; i < cards.length; i++) {
      const canvas = await html2canvas(cards[i]);
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      if (i !== 0 && i % graphsRow === 0 && i !== graphsPage) {
        y += canvas.height / dimRatio + 20;
        x = 40;
      }

      if (i !== 0 && i % graphsPage === 0) {
        pdf.addPage();
        x = 40;
        y = 20;
      }

      pdf.addImage(imgData, x, y, canvas.width / dimRatio, canvas.height / dimRatio);
      x += canvas.width / dimRatio + 10;
    }

    pdf.save('report_personalizzata_' + user.username + '_' + day + '-' + month + '-' + year + '.pdf');

    this.closeModal();
  }

  async getUserCompany() {
    return <User>await this.userService.get().toPromise();
  }

  formatStringDate(date: Date) {
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }

  openModal(template: TemplateRef<any> | ElementRef, ignoreBackdrop: boolean = false) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-md modal-dialog-centered',
      ignoreBackdropClick: ignoreBackdrop,
      keyboard: !ignoreBackdrop
    });
  }

  closeModal(): void {
    this.submitted = false;
    this.modalRef.hide();
  }

  optionModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered'});
  }

  async getFbPagesList() {
    try {
      this.fbPageList = await this.FBService.getPages().toPromise();
    } catch (e) {
      console.error('getViewList -> Error doing the query');
    }
  }

  async getFbPageID() {
    let pageID;
    try {
      pageID = (await this.apiKeyService.getAllKeys().toPromise()).fb_page_id;
    } catch (e) {
      console.error('getFbPageID -> error doing the query', e);
    }
    return pageID;
  }

  dragAndDrop() {
    if (this.chartArray$.length === 0) {
      this.toastr.error(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'NO_ORDINAMENTO'),
        this.GEService.getStringToastr(true, false, 'DASHBOARD', 'NO_ORDINAMENTO'));
    } else {
      this.drag = true;
      this.GEService.dragAndDrop.next(this.drag);
    }

    if (this.drag === true) {
      this.toastr.info(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'MOD_ORD'),
        this.GEService.getStringToastr(true, false, 'DASHBOARD', 'MOD_ORD'));
    }

  }

  onMovement($event, value) {

    if (!value) {
      let i = 0;
      this.tmpArray = $event;
      this.chartArray$ = this.tmpArray;

      for (i = 0; i < this.chartArray$.length; i++) {
        this.chartArray$[i].position = i + 1;
      }

    } else {
      this.updateChartPosition(this.chartArray$);
      this.GEService.loadingScreen.next(false);
    }

  }

  updateChartPosition(toUpdate): void {

    toUpdate = _.map(toUpdate, function (el) {
      return {'chart_id': el.chart_id, 'dashboard_id': el.dashboard_id, 'position': el.position};
    });

    this.DService.updateChartPosition(toUpdate)
      .subscribe(() => {
        // this.GEService.updateChartInDashboard.next(toUpdate);
        this.filterActions.updateChartPosition(toUpdate, this.D_TYPE.CUSTOM);
        this.closeModal();
        this.drag = false;
        this.GEService.dragAndDrop.next(this.drag);

        this.toastr.success(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'SUC_ORD'),
          this.GEService.getStringToastr(true, false, 'DASHBOARD', 'SUC_ORD'));
      }, error => {

        this.toastr.error(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'ERR_ORD'),
          this.GEService.getStringToastr(true, false, 'DASHBOARD', 'ERR_ORD'));
        console.log('Error updating the Dashboard');
        console.log(error);
      });

  }

  checkDrag() {
    this.drag = false;
    this.GEService.dragAndDrop.next(this.drag);
  }

  conversionSetDefaultLang() {

    switch (this.user.lang) {
      case 'it' :
        this.value = 'Italiano';
        break;
      case 'en' :
        this.value = 'English';
        break;
      default:
        this.value = 'Italiano';
    }

    return this.value;
  }

  getNameMinicard(id_minicard) {

    this.userService.get().subscribe(data => {
      this.user = data;

      this.http.get('./assets/langSetting/langStringVarious/' + this.conversionSetDefaultLang() + '.json')
        .subscribe(file => {
          this.GEService.langFilterDate.next(file);

          switch (id_minicard) {
            case '0' :
              this.miniCards[id_minicard].name = this.GEService.getStringNameMinicard('CUSTOM', 'UT_TOT');
              break;
            case '1' :
              this.miniCards[id_minicard].name = this.GEService.getStringNameMinicard('CUSTOM', 'FAN');
              break;
            case '2' :
              this.miniCards[id_minicard].name = this.GEService.getStringNameMinicard('CUSTOM', 'FOLLOWER');
              break;
            case '3' :
              this.miniCards[id_minicard].name = this.GEService.getStringNameMinicard('CUSTOM', 'ISCR');
              break;
          }

        }, err => {
          console.error(err);
        });

    }, err => {
      console.error(err);
    });


  }

}
