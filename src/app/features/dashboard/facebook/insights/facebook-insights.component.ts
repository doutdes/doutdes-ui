import {Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FacebookService} from '../../../../shared/_services/facebook.service';
import {BreadcrumbActions} from '../../../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../../../core/breadcrumb/Breadcrumb';
import {DashboardService} from '../../../../shared/_services/dashboard.service';
import {ChartsCallsService} from '../../../../shared/_services/charts_calls.service';
import {GlobalEventsManagerService} from '../../../../shared/_services/global-event-manager.service';
import {DashboardCharts} from '../../../../shared/_models/DashboardCharts';

import {DragulaService} from 'ng2-dragula';
import * as _ from 'lodash';

import {subDays} from 'date-fns';
import {FilterActions} from '../../redux-filter/filter.actions';
import {DashboardData, IntervalDate} from '../../redux-filter/filter.model';
import {select} from '@angular-redux/store';
import {forkJoin, Observable, Subject} from 'rxjs';
import {ApiKeysService} from '../../../../shared/_services/apikeys.service';

import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {User} from '../../../../shared/_models/User';
import {UserService} from '../../../../shared/_services/user.service';
import {ngxLoadingAnimationTypes} from 'ngx-loading';
import {D_TYPE} from '../../../../shared/_models/Dashboard';
import {FbMiniCards, MiniCard} from '../../../../shared/_models/MiniCard';
import {ToastrService} from 'ngx-toastr';
import {BsLocaleService, BsModalRef, BsModalService} from 'ngx-bootstrap';
import {ApiKey} from '../../../../shared/_models/ApiKeys';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ChartParams} from '../../../../shared/_models/Chart';
import {TranslateService} from '@ngx-translate/core';
import {AppComponent} from '../../../../app.component';
import {HttpClient} from '@angular/common/http';
import {takeUntil} from 'rxjs/operators';

const PrimaryWhite = '#ffffff';

@Component({
  selector: 'app-feature-dashboard-facebook-insights',
  templateUrl: './facebook-insights.component.html',
  styleUrls: ['../../../../../assets/css/dragula.css']
})

export class FeatureDashboardFacebookInsightComponent implements OnInit, OnDestroy {

  @ViewChild('reportWait') reportWait;
  @ViewChild('selectView') selectView;
  @ViewChild('fbPagePreferences') fbPagePreferences;

  public D_TYPE = D_TYPE;
  public HARD_DASH_DATA = {
    dashboard_type: D_TYPE.FB,
    dashboard_id: null
  };

  private pageID = null;

  public FILTER_DAYS = {
    yesterday: 1,
    seven: 6,
    thirty: 29,
    ninety: 89
  };

  public config = {
    animationType: ngxLoadingAnimationTypes.threeBounce,
    backdropBackgroundColour: 'rgba(0,0,0,0.1)',
    backdropBorderRadius: '4px',
    primaryColour: PrimaryWhite,
    secondaryColour: PrimaryWhite
  };

  public chartArray$: Array<DashboardCharts> = [];
  public miniCards: MiniCard[] = FbMiniCards;
  private dashStored: Array<DashboardCharts> = [];
  public tmpArray: Array<DashboardCharts> = [];

  public loading = false;
  public isApiKeySet = true;

  loaded: boolean = false;
  modalRef: BsModalRef;

  // Form for init
  selectViewForm: FormGroup;
  loadingForm: boolean;
  pageList = [];
  submitted: boolean;
  currentNamePage;

  @select() filter: Observable<any>;

  firstDateRange: Date;
  lastDateRange: Date;
  maxDate: Date = subDays(new Date(), this.FILTER_DAYS.yesterday);
  minDate: Date = subDays(this.maxDate, this.FILTER_DAYS.ninety);
  bsRangeValue: Date[];
  dateChoice: String = null;

  dashErrors = {
    emptyMiniCards: false,
    noPages: false
  };
  // datePickerEnabled = false; // Used to avoid calling onValueChange() on component init

  drag: boolean;

  value: any;
  tmp: string;
  user: User;

  data: any;

  constructor(
    private appComponent: AppComponent,
    private FBService: FacebookService,
    private apiKeyService: ApiKeysService,
    private breadcrumbActions: BreadcrumbActions,
    private DService: DashboardService,
    private CCService: ChartsCallsService,
    private GEService: GlobalEventsManagerService,
    private filterActions: FilterActions,
    private userService: UserService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private localeService: BsLocaleService,
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

  async loadMiniCards(pageID) {
    // 1. Init intervalData (retrieve data of previous month)
    let results;
    let empty = false;
    let date = new Date();
    const y = date.getFullYear();
    const m = date.getMonth();
    const intervalDate: IntervalDate = {
      first: new Date(y, m, 1),
      last: new Date(new Date(y, m + 1, 0).setHours(23, 59, 59, 999))
    };

    let pageIDs = {};

    pageIDs[D_TYPE.FB] = pageID;
    const observables = this.CCService.retrieveMiniChartData(D_TYPE.FB, pageIDs, null);


    forkJoin(observables).subscribe(miniDatas => {
      for (const i in miniDatas) {
        results = this.CCService.formatMiniChartData(miniDatas[i], D_TYPE.FB, this.miniCards[i].measure, intervalDate);
        empty = empty || !results;

        this.getNameMinicard(i);
        this.miniCards[i].value = results['value'];
        this.miniCards[i].progress = results['perc'] + '%';
        this.miniCards[i].step = results['step'];
      }
    });

    return empty;

  }

  async loadDashboard() { // TODO get pageID and refactor
    let dash, chartParams: ChartParams = {};
    const observables: Observable<any>[] = [];
    const chartsToShow: Array<DashboardCharts> = [];
    const dateInterval: IntervalDate = {
      first: this.minDate,
      last: this.maxDate
    };
    const currentData: DashboardData = {
      data: chartsToShow,
      interval: dateInterval,
      type: D_TYPE.FB,
    };

    this.GEService.loadingScreen.next(true);

    this.dragulaService.find('REVERT');

    try {
      // Retrieving dashboard ID
      dash = await this.DService.getDashboardByType(D_TYPE.FB).toPromise(); // Facebook type
      if (dash.id) {
        this.HARD_DASH_DATA.dashboard_id = dash.id; // Retrieving dashboard id
      } else {
        console.error('Cannot retrieve a page ID for the Facebook dashboard.');
        return;
      }
      // console.log(this.HARD_DASH_DATA.dashboard_id);
      this.dashErrors.emptyMiniCards = await this.loadMiniCards(this.pageID);

      if (this.dashStored) {
        // Ci sono già dati salvati
        this.filterActions.loadStoredDashboard(D_TYPE.FB);
        this.bsRangeValue = [subDays(this.maxDate, this.FILTER_DAYS.thirty), this.lastDateRange];
        this.GEService.loadingScreen.next(false);

        if (this.chartArray$.length === 0) {
          this.toastr.info(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'VUOTA'),
            this.GEService.getStringToastr(true, false, 'DASHBOARD', 'VUOTA'));
        }
      } else {
        const ds: Subject<void> = new Subject<void>(); // used to force unsubscription

        // Retrieving dashboard charts
        this.DService.getAllDashboardCharts(this.HARD_DASH_DATA.dashboard_id)
          .subscribe(charts => {

            if (charts && charts.length > 0) { // Checking if dashboard is not empty

              charts.forEach(chart => {
                chartParams = {
                  metric: chart.metric,
                };
                observables.push(this.CCService.retrieveChartData(chart.type, chartParams, this.pageID));
              }); // Retrieves data for each chart
              forkJoin(observables)
                .pipe(takeUntil(ds))
                .subscribe(dataArray => {
                  for (let i = 0; i < dataArray.length; i++) {

                    const chart: DashboardCharts = charts[i];
                    if ((dataArray.length > 0 && dataArray[i] == null)) {
                      chart.error = true;
                      console.warn('The attached chart does not contain any data.', chart);
                    } else if (!dataArray[i].status && chart) { // If no error is occurred when retrieving chart data
                      if (dataArray[i].length === 0) { //if there is no data available
                        chart.error = true;
                      } else {
                        chart.chartData = dataArray[i];
                        let date = new Date(chart.chartData[0]['end_time']);
                        if (date < this.minDate) {
                          this.minDate = date;
                        }
                        // chart.color = chart.chartData.options.color ? chart.chartData.options.colors[0] : null; TODO Check
                        chart.error = false;
                      }
                    } else {
                      chart.error = true;

                      console.error('ERROR in FACEBOOK COMPONENT. Cannot retrieve data from one of the charts. More info:');
                      console.error(dataArray[i]);
                    }

                    chartsToShow.push(chart); // Original Data

                  }
                  ds.next();
                  ds.complete();

                  currentData.data = chartsToShow;

                  this.filterActions.initData(currentData);
                  this.GEService.updateChartList.next(true); // TODO check to remove

                  // Shows last 30 days
                  // this.datePickerEnabled = true;
                  this.bsRangeValue = [subDays(this.maxDate, this.FILTER_DAYS.thirty), this.lastDateRange];

                  this.GEService.loadingScreen.next(false);
                });

            } else {
              this.filterActions.initData(currentData);
              this.bsRangeValue = [subDays(this.maxDate, this.FILTER_DAYS.thirty), this.lastDateRange];
              this.GEService.loadingScreen.next(false);
              this.toastr.info(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'VUOTA'),
                this.GEService.getStringToastr(true, false, 'DASHBOARD', 'VUOTA'));
            }

          }, err => {
            console.error('ERROR in FACEBOOK COMPONENT, when fetching charts.');
            console.warn(err);
          });

      }
      this.loaded = true;

    } catch (e) {
      console.error('ERROR in CUSTOM-COMPONENT. Cannot retrieve dashboard charts. More info:');
      console.error(e);
    }

  }

  async addChartToDashboard(dashChart: DashboardCharts) {
    const chartToPush: DashboardCharts = dashChart;
    const intervalDate: IntervalDate = {
      first: this.bsRangeValue[0],
      last: this.bsRangeValue[1]
    };

    const dummySubj: Subject<void> = new Subject<void>(); // used to force unsubscription
    const chartParams: ChartParams = {
      metric: dashChart.metric
    };

    try {
      this.CCService.retrieveChartData(dashChart.type, chartParams, this.pageID)
        .pipe(takeUntil(dummySubj))
        .subscribe(data => {

          this.GEService.loadingScreen.next(true);

          if (!data['status']) { // Se la chiamata non rende errori
            chartToPush.chartData = data;
            chartToPush.error = false;

            this.toastr.success(dashChart.title + this.GEService.getStringToastr(false, true, 'DASHBOARD', 'ADD'),
              this.GEService.getStringToastr(true, false, 'DASHBOARD', 'ADD'));

          } else {
            chartToPush.error = true;
            console.log('Errore recuperando dati per ' + dashChart);
          }

          this.filterActions.addChart(chartToPush);
          this.filterActions.filterData(intervalDate); // Dopo aver aggiunto un grafico, li porta tutti alla stessa data

          this.GEService.loadingScreen.next(false);

          dummySubj.next();
          dummySubj.complete();
        });
    } catch (err) {
      console.log('Error querying the chart');
      console.log(err);
    }
  }

  onValueChange(value): void {

    if (value) {// && this.datePickerEnabled) {

      const dateInterval: IntervalDate = {
        first: new Date(value[0].setHours(0, 0, 0, 0)),
        last: new Date(value[1].setHours(23, 59, 59))
      };

      this.filterActions.filterData(dateInterval);

      let diff = Math.abs(dateInterval.first.getTime() - dateInterval.last.getTime());
      let diffDays = Math.ceil(diff / (1000 * 3600 * 24)) - 1;

      if (!Object.values(this.FILTER_DAYS).includes(diffDays)) {
        this.dateChoice = 'Personalizzato';
      }
    }
  }

  changeDateFilter(days: number) {

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
    bread.push(new Breadcrumb('Facebook Insights', '/dashboard/facebook/insights'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  async checkExistence() {
    let response, isPermissionGranted, result = null;

    try {
      response = await this.apiKeyService.checkIfKeyExists(D_TYPE.FB).toPromise();
      isPermissionGranted = await this.apiKeyService.isPermissionGranted(D_TYPE.FB).toPromise();

      if (isPermissionGranted.tokenValid) {
        result = response['exists'] && isPermissionGranted['granted'];
      } else {
        this.toastr.error(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'NO_PERMESSI'),
          this.GEService.getStringToastr(true, false, 'DASHBOARD', 'NO_PERMESSI'));
      }

    } catch (e) {
      console.error(e);
    }

    return result;
  }

  async ngOnInit() {
    let fb_page_id;
    let existence, update;
    let key: ApiKey;

    this.GEService.loadingScreen.subscribe(value => {
      this.loading = value;
    });

    this.addBreadcrumb();

    try {
      existence = await this.checkExistence();

      if (!existence) { // If the Api Key has not been set yet, then a message is print
        this.isApiKeySet = false;
        return;
      }
      await this.getPagesList();
      this.createForm();
      fb_page_id = await this.getPageID();
      // We check if the user has already set a preferred page if there is more than one in his permissions.
      if (!fb_page_id) {
        // await this.getPagesList();

        if (this.pageList.length === 0) {
          this.dashErrors.noPages = true;
          return;
        }

        if (this.pageList.length === 1) {
          key = {fb_page_id: this.pageList[0]['id'], service_id: D_TYPE.FB};
          update = await this.apiKeyService.updateKey(key).toPromise();
          this.pageID = key.fb_page_id;
          if (!update) {
            return;
          }
        } else {
          this.openModal(this.selectView, true);
          return;
        }
      } else {
        this.pageID = fb_page_id;
      }
      this.currentNamePage = await this.getPageName(this.pageID);
      this.firstDateRange = this.minDate;
      this.lastDateRange = this.maxDate;
      this.bsRangeValue = [this.firstDateRange, this.lastDateRange];

      this.GEService.loadingScreen.subscribe(value => {
        this.loading = value;
      });

      this.filter.subscribe(elements => {
        this.chartArray$ = elements['filteredDashboard'] ? elements['filteredDashboard']['data'] : [];
        const index = elements['storedDashboards']
          ? elements['storedDashboards'].findIndex((el: DashboardData) => el.type === D_TYPE.FB)
          : -1;
        this.dashStored = index >= 0 ? elements['storedDashboards'][index] : null;
      });

      const dash_type = this.HARD_DASH_DATA.dashboard_type;

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

        this.GEService.addSubscriber(dash_type);
      }
      await this.loadDashboard();
    } catch (e) {
      console.error('Error on ngOnInit of Facebook', e);
    }

  }

  ngOnDestroy() {
    this.removeBreadcrumb();
    this.filterActions.removeCurrent();

    this.dragulaService.destroy('REVERT');
  }

  clearDashboard(): void {
    this.DService.clearDashboard(this.HARD_DASH_DATA.dashboard_id).subscribe(() => {
      this.filterActions.clearDashboard(D_TYPE.FB);
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
    pdf.text('REPORT DASHBOARD FACEBOOK', x, y - 5);
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

    pdf.save('report_fb_' + user.username + '_' + day + '-' + month + '-' + year + '.pdf');

    this.closeModal();
  }

  formatStringDate(date: Date) {
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }

  async getUserCompany() {
    return <User>await this.userService.get().toPromise();
  }

  nChartEven() {
    return this.chartArray$.length % 2 === 0;
  }

  openModal(template: TemplateRef<any> | ElementRef, ignoreBackdrop: boolean = false) {
    this.drag = false;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-md modal-dialog-centered',
      ignoreBackdropClick: ignoreBackdrop,
      keyboard: !ignoreBackdrop
    });
  }

  closeModal() {
    this.submitted = false;
    this.modalRef.hide();
  }

  async selectViewSubmit() {
    let update;
    this.submitted = true;

    if (this.selectViewForm.invalid) {
      this.loadingForm = false;
      return;
    }

    const key: ApiKey = {
      fb_page_id: this.selectViewForm.value.fb_page_id,
      service_id: D_TYPE.FB
    };

    this.loadingForm = true;

    try {
      update = await this.apiKeyService.updateKey(key).toPromise();
      if (update) {
        this.closeModal();
        location.reload();
      }
    } catch (e) {
      console.log (e);
    }
  }

  async getPageID() {
    let pageID;

    try {
      pageID = (await this.apiKeyService.getAllKeys().toPromise()).fb_page_id;
    } catch (e) {
      console.error('getPageID -> error doing the query', e);
    }

    return pageID;
  }

  async getPagesList() {
    try {
      this.pageList = await this.FBService.getPages().toPromise();
    } catch (e) {
      console.error('getFbPageList -> Error doing the query');
    }
  }

  async getPageName(fbPage) {
    let pageName;
    try {
      pageName = _.find(this.pageList, {'id': fbPage});
      return pageName.name;
    } catch (e) {
      console.log(e);
    }
  }

  optionModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered'});
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
        this.filterActions.updateChartPosition(toUpdate, this.D_TYPE.FB);
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
              this.miniCards[id_minicard].name = this.GEService.getStringNameMinicard('FACEBOOK', 'FAN');
              break;
            case '1' :
              this.miniCards[id_minicard].name = this.GEService.getStringNameMinicard('FACEBOOK', 'POST');
              break;
            case '2' :
              this.miniCards[id_minicard].name = this.GEService.getStringNameMinicard('FACEBOOK', 'REAZIONI');
              break;
            case '3' :
              this.miniCards[id_minicard].name = this.GEService.getStringNameMinicard('FACEBOOK', 'VISITE');
              break;
          }

        }, err => {
          console.error(err);
        });

    }, err => {
      console.error(err);
    });


  }

  createForm() {
    this.selectViewForm = this.formBuilder.group({
      fb_page_id: ['', Validators.compose([Validators.maxLength(20), Validators.required])],
    });
    this.selectViewForm.controls['fb_page_id'].setValue(this.pageList[0].id);
  }

}
