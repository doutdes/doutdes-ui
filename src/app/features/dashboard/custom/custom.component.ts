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
import {D_TYPE} from '../../../shared/_models/Dashboard';
import {ApiKeysService} from '../../../shared/_services/apikeys.service';
import {ToastrService} from 'ngx-toastr';
import {ApiKey} from '../../../shared/_models/ApiKeys';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {CustomMiniCards, MiniCard} from '../../../shared/_models/MiniCard';

const PrimaryWhite = '#ffffff';

@Component({
  selector: 'app-feature-dashboard-custom',
  templateUrl: './custom.component.html'
})

export class FeatureDashboardCustomComponent implements OnInit, OnDestroy {

  @ViewChild('selectView') selectView;

  public HARD_DASH_DATA = {
    dashboard_type: D_TYPE.CUSTOM,
    dashboard_id: null,
    permissions: null
  };

  private fbPageID = null;
  private igPageID = null;
  public somethingGranted = true;

  public FILTER_DAYS = {
    seven: 6,
    thirty: 29,
    ninety: 89
  };

  public chartArray$: Array<DashboardCharts> = [];
  public miniCards: MiniCard[] = CustomMiniCards;
  private dashStored: Array<DashboardCharts> = [];

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
  minDate: Date = new Date('2018-01-01');
  maxDate: Date = new Date();
  bsRangeValue: Date[];
  dateChoice: String = 'Preset';
  modalRef: BsModalRef;

  // Form for init
  selectViewForm: FormGroup;
  loadingForm: boolean;
  submitted: boolean;
  viewList;

  constructor(
    private GAService: GoogleAnalyticsService,
    private FBService: FacebookService,
    private IGService: InstagramService,
    private breadcrumbActions: BreadcrumbActions,
    private DService: DashboardService,
    private CCService: ChartsCallsService,
    private GEService: GlobalEventsManagerService,
    private filterActions: FilterActions,
    private apiKeyService: ApiKeysService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder
  ) {
  }

  async ngOnInit() {
    let existence, view_id;
    let key: ApiKey;

    this.addBreadcrumb();
    this.GEService.loadingScreen.next(true);

    try {
      existence = await this.checkExistence();

      if(!existence.somethingGranted) {
        this.somethingGranted = false;
        this.GEService.loadingScreen.next(false);
        return;
      }

      this.HARD_DASH_DATA.permissions = (await this.checkExistence()).permissions;
      view_id = await this.getViewID();

      // We check if the user has already set a preferred GOOGLE page if there is more than one in his permissions.
      if(!view_id) {
        await this.getViewList();

        if(this.viewList.length === 1) {
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

      // Retrieving the pages ID // TODO to add the choice of the page, now it takes just the first one
      this.fbPageID = this.HARD_DASH_DATA.permissions[D_TYPE.FB] ? (await this.FBService.getPages().toPromise())[0].id : null;
      this.igPageID = this.HARD_DASH_DATA.permissions[D_TYPE.IG] ? (await this.IGService.getPages().toPromise())[0].id : null;

      this.firstDateRange = subDays(new Date(), 30); //this.minDate;
      this.lastDateRange = this.maxDate;
      //this.bsRangeValue = [this.firstDateRange, this.lastDateRange];
      this.bsRangeValue = [subDays(new Date(), 30), this.lastDateRange]; // Starts with Last 30 days

      this.filter.subscribe(elements => {
        this.chartArray$ = elements['filteredDashboard'] ? elements['filteredDashboard']['data'] : [];
        const index = elements['storedDashboards'] ? elements['storedDashboards'].findIndex((el: DashboardData) => el.type === D_TYPE.CUSTOM) : -1;
        this.dashStored = index >= 0 ? elements['storedDashboards'][index] : null;
      });

      let dash_type = this.HARD_DASH_DATA.dashboard_type;

      if (!this.GEService.isSubscriber(dash_type)) {
        this.GEService.removeFromDashboard.subscribe(values => {
          if (values[0] !== 0 && values[1] === this.HARD_DASH_DATA.dashboard_id) {
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
        this.GEService.loadingScreen.subscribe(value => {
          this.loading = value;
        });

        this.GEService.addSubscriber(dash_type);
      }

      await this.loadMiniCards();
      await this.loadDashboard();
      this.GEService.loadingScreen.next(false);

    } catch (e) {
      console.error('Error on ngOnInit of Google Analytics', e);
      this.toastr.error('È stato riscontrato un errore durante il carimento della dashboard. Per favore, riprova oppure contatta il supporto.', 'Errore nel carimento della dashboard');
    }
  }

  async loadDashboard() {

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

    try {
      // Retrieving dashboard ID
      dash = await this.DService.getDashboardByType(D_TYPE.CUSTOM).toPromise(); // Custom dashboard type

      if (dash.id) {
        this.HARD_DASH_DATA.dashboard_id = dash.id; // Retrieving dashboard id
      } else {
        this.toastr.error('Non è stato possibile recuperare la dashboard. Per favore, contatta il supporto.', 'Errore durante l\'inizializzazione della dashboard.');
        return;
      }

      if (this.dashStored) {
        // Ci sono già dati salvati
        this.filterActions.loadStoredDashboard(D_TYPE.CUSTOM);
        this.bsRangeValue = [subDays(new Date(), this.FILTER_DAYS.thirty), this.lastDateRange];
      } else {
        charts = await this.DService.getAllDashboardCharts(this.HARD_DASH_DATA.dashboard_id).toPromise();

        if (charts && charts.length > 0) { // Checking if dashboard is not empty
          charts.forEach(async chart => {
            // If the permission for the service is granted
            if (this.HARD_DASH_DATA.permissions[chart.type] === true) {
              pageID = this.getPageID(chart.type);
              observables.push(this.CCService.retrieveChartData(chart.chart_id, pageID));
            }
          }); // Retrieves data for each chart


          dataArray = await forkJoin(observables).toPromise();

          if (dataArray) {
            for (let i = 0; i < dataArray.length; i++) {

              let chart: DashboardCharts = charts[i];

              if (!dataArray[i].status && chart) { // If no error is occurred when retrieving chart data
                chart.chartData = dataArray[i];
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
            this.bsRangeValue = [subDays(new Date(), this.FILTER_DAYS.thirty), this.lastDateRange];

            this.GEService.loadingScreen.next(false);
          }
        } else {
          this.filterActions.initData(currentData);
          this.GEService.loadingScreen.next(false);
          this.toastr.info('Puoi iniziare aggiungendo un nuovo grafico.','La tua dashboard è vuota');
        }
      }

    } catch (e) {
      this.toastr.error('Non è stato possibile recuperare la dashboard. Per favore, contatta il supporto.', 'Errore durante l\'inizializzazione della dashboard.');
    }
  }

  addChartToDashboard(dashChart: DashboardCharts) {
    const chartToPush: DashboardCharts = dashChart;
    let pageID = null;

    const dateInterval: IntervalDate = {
      first: this.bsRangeValue[0],
      last: this.bsRangeValue[1]
    };

    pageID = this.getPageID(dashChart.type);

    this.CCService.retrieveChartData(dashChart.chart_id, pageID, dateInterval)
      .subscribe(chartData => {
        if (!chartData['status']) { // Se la chiamata non rende errori
          chartToPush.chartData = chartData;
          chartToPush.error = false;

          this.toastr.success('"' + dashChart.title + '" è stato correttamente aggiunto alla dashboard.', 'Grafico aggiunto!');
        } else {
          chartToPush.error = true;
          console.log('Errore recuperando dati per ' + dashChart);

          this.toastr.error('I dati disponibili per ' + dashChart.title +' potrebbero essere non sufficienti', 'Errore durante l\'aggiunta del grafico');
        }
        this.filterActions.addChart(chartToPush);
      }, error1 => {
        console.log('Error querying the Chart');
        console.log(error1);

        this.toastr.error('C\'è stato un errore recuperando i dati per il grafico ' + dashChart.title + '. Per favore, riprova più tardi oppure contatta il supporto.', 'Errore durante l\'aggiunta del grafico');
      });
  }

  onValueChange(value): void {
    if (value) {
      const dateInterval: IntervalDate = {
        first: new Date(value[0].setHours(0, 0, 0, 0)),
        last: new Date(value[1].setHours(23, 59, 59))
      };
      this.filterActions.filterData(dateInterval);

      let diff = Math.abs(dateInterval.first.getTime() - dateInterval.last.getTime());
      let diffDays = Math.ceil(diff / (1000 * 3600 * 24)) - 1;

      if (!Object.values(this.FILTER_DAYS).includes(diffDays)) {
        this.dateChoice = 'Custom';
      }
    }
  }

  changeData(days: number) {
    this.bsRangeValue = [subDays(new Date(), days), this.lastDateRange];

    switch (days) {
      case this.FILTER_DAYS.seven:
        this.dateChoice = 'Last 7 days';
        break;
      case this.FILTER_DAYS.thirty:
        this.dateChoice = 'Last 30 days';
        break;
      case this.FILTER_DAYS.ninety:
        this.dateChoice = 'Last 90 days';
        break;
      default:
        this.dateChoice = 'Custom';
        break;
    }
  }

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Dashboard', '/dashboard/'));
    bread.push(new Breadcrumb('Sito web', '/dashboard/google/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  ngOnDestroy() {
    this.removeBreadcrumb();
    this.filterActions.removeCurrent();
  }

  nChartEven() {
    return this.chartArray$.length % 2 === 0;
  }

  getPageID(type: number) {
    let pageID;

    switch (type) {
      case D_TYPE.FB:
        pageID = this.fbPageID;
        break;
      case D_TYPE.IG:
        pageID = this.igPageID;
        break;
      default:
        pageID = null;
        break;
    }

    return pageID;
  }

  async checkExistence() {
    let permissions = {};
    let keys = Object.keys(D_TYPE);
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
    let permissions = this.HARD_DASH_DATA.permissions;
    let date = new Date(), y = date.getFullYear(), m = date.getMonth();

    const intervalDate: IntervalDate = {
      first: new Date(y, m - 1, 1),
      last: new Date(new Date(y, m, 0).setHours(23, 59, 59, 999))
    };

    pageIDs[D_TYPE.FB] = this.fbPageID;
    pageIDs[D_TYPE.IG] = this.igPageID;

    const observables = this.CCService.retrieveMiniChartData(D_TYPE.CUSTOM, pageIDs, intervalDate, permissions);

    forkJoin(observables).subscribe(miniDatas => {
      for (const i in miniDatas) {
        if(Object.entries(miniDatas[i]).length !== 0) {
          results = this.CCService.formatMiniChartData(miniDatas[i], D_TYPE.CUSTOM, this.miniCards[i].measure, intervalDate);
          this.miniCards[i].value = results['value'];
          this.miniCards[i].progress = results['perc'] + '%';
          this.miniCards[i].step = results['step'];
        } else {
          this.miniCards[i].value = '-';
          this.miniCards[i].progress = '0%';
          this.miniCards[i].step = 0;
        }
      }
    });

    // TODO Remove YT simulation card
    results = this.CCService.formatMiniChartData(null, D_TYPE.CUSTOM, this.miniCards[3].measure);
    this.miniCards[3].value = results['value'];
    this.miniCards[3].progress = results['perc'] + '%';
    this.miniCards[3].step = results['step'];
  }

  async getViewID()  {
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

  async selectViewSubmit(){
    let update;
    this.submitted = true;

    if (this.selectViewForm.invalid) {
      this.loadingForm = false;
      return;
    }

    const key: ApiKey = {
      ga_view_id: this.selectViewForm.value.view_id,
      service_id: D_TYPE.GA
    };

    this.loadingForm = true;

    update = await this.apiKeyService.updateKey(key).toPromise();

    if(update) {
      this.closeModal();
      await this.ngOnInit();
    } else {
      console.error('MANDARE ERRORE');
    }
  }

  openModal(template: TemplateRef<any> | ElementRef, ignoreBackdrop: boolean = false) {
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered', ignoreBackdropClick: ignoreBackdrop, keyboard: !ignoreBackdrop});
  }

  closeModal(): void {
    this.modalRef.hide();
  }
}
