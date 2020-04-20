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
import {AggregatedDataService} from '../../../shared/_services/aggregated-data.service';

import {DragulaService} from 'ng2-dragula';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {UserService} from '../../../shared/_services/user.service';
import {User} from '../../../shared/_models/User';
import {D_TYPE} from '../../../shared/_models/Dashboard';
import {GaMiniCards, MiniCard} from '../../../shared/_models/MiniCard';
import {BsLocaleService, BsModalRef, BsModalService, parseDate, PopoverModule} from 'ngx-bootstrap';
import {ApiKeysService} from '../../../shared/_services/apikeys.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ApiKey} from '../../../shared/_models/ApiKeys';
import {ToastrService} from 'ngx-toastr';
import * as _ from 'lodash';
import {ChartParams} from '../../../shared/_models/Chart';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-feature-dashboard-google',
  templateUrl: './googleAnalytics.component.html',
  styleUrls: ['../../../../assets/css/dragula.css']
})

export class FeatureDashboardGoogleAnalyticsComponent implements OnInit, OnDestroy {

  // @ViewChild(ToastContainerDirective) toastContainer: ToastContainerDirective;
  @ViewChild('selectView') selectView;
  @ViewChild('reportWait') reportWait;
  @ViewChild('gaPagePreferences') gaPagePreferences;

  public D_TYPE = D_TYPE;
  public HARD_DASH_DATA = {
    dashboard_type: D_TYPE.GA,
    dashboard_id: null
  };

  public FILTER_DAYS = { // Deve avere un valore in meno per avere un intervallo corretto
    yesterday: 1,
    seven: 6,
    thirty: 29,
    ninety: 89
  };

  public chartArray$: Array<DashboardCharts> = [];
  public miniCards: MiniCard[] = GaMiniCards;
  private dashStored: DashboardData;
  public tmpArray: Array<DashboardCharts> = [];

  public loading = false;
  public isApiKeySet: boolean = true;

  loaded: boolean = false;

  @select() filter: Observable<any>;

  // Date variables
  firstDateRange: Date;
  lastDateRange: Date;
  maxDate: Date = subDays(new Date(), this.FILTER_DAYS.yesterday);
  minDate: Date = subDays(this.maxDate, this.FILTER_DAYS.ninety);
  bsRangeValue: Date[];
  dateChoice: String = null;
  modalRef: BsModalRef;

  // Form for init
  selectViewForm: FormGroup;
  loadingForm: boolean;
  viewList = [];
  submitted: boolean;
  dashErrors = {
    emptyMiniCards: false,
    noPages: false
  };
  currentNamePage;
  oldCurrentNamePage: string = 'Google Analytics';

  drag: boolean;
  lang: string;
  value: string;
  tmp: string;
  user: User;


  constructor(
    private GAService: GoogleAnalyticsService,
    private breadcrumbActions: BreadcrumbActions,
    private DService: DashboardService,
    private CCService: ChartsCallsService,
    private GEService: GlobalEventsManagerService,
    private filterActions: FilterActions,
    private userService: UserService,
    private toastr: ToastrService,
    private ADService: AggregatedDataService,
    private modalService: BsModalService,
    private apiKeyService: ApiKeysService,
    private formBuilder: FormBuilder,
    private dragulaService: DragulaService,
    public translate: TranslateService,
    private http: HttpClient
  ) {
    this.dragulaService.createGroup('REVERT', {
      revertOnSpill: false,
    });

    this.userService.get().subscribe(value => {
      this.user = value;

      this.http.get('./assets/langSetting/langToastr/' + this.conversionSetDefaultLang() + '.json')
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
    let existence, view_id, update;
    let key: ApiKey;

    this.GEService.loadingScreen.subscribe(value => {
      this.loading = value;
    });
    this.addBreadcrumb();

    try {
      existence = await this.checkExistance();

      if (!existence) { // If the Api Key has not been set yet, then a message is print
        this.isApiKeySet = false;
        return;
      }

      await this.getViewList();
      this.createForm();
      view_id = await this.getViewID();
      // We check if the user has already set a preferred page if there is more than one in his permissions.
      if (!view_id) {

        if (this.viewList.length === 0) {
          this.dashErrors.noPages = true;
          return;
        }

        if (this.viewList.length === 1) {
          key = {ga_view_id: this.viewList[0]['id'], service_id: D_TYPE.GA};
          view_id = key['ga_view_id'];
          update = await this.apiKeyService.updateKey(key).toPromise();
          view_id = key['ga_view_id'];

          if (!update) {
            return;
          }
        } else {
          this.selectViewForm = this.formBuilder.group({
            view_id: ['', Validators.compose([Validators.maxLength(15), Validators.required])],
          });
          this.selectViewForm.controls['view_id'].setValue(this.viewList[0].id);

          this.openModal(this.selectView, true);

          return;
        }
      }
      this.currentNamePage = await this.getViewName(view_id);
      this.oldCurrentNamePage = this.currentNamePage;
      if (this.currentNamePage.length > 15) {

        this.currentNamePage = this.currentNamePage.slice(0, 13) + '...';
      }
      this.firstDateRange = subDays(this.maxDate, this.FILTER_DAYS.thirty); // this.minDate;
      this.lastDateRange = this.maxDate;
      // this.bsRangeValue = [this.firstDateRange, this.lastDateRange];
      this.bsRangeValue = [subDays(this.maxDate, this.FILTER_DAYS.thirty), this.lastDateRange]; // Starts with Last 30 days

      this.filter.subscribe(elements => {
        this.chartArray$ = elements['filteredDashboard'] ? elements['filteredDashboard']['data'] : [];
        const index = elements['storedDashboards'] ? elements['storedDashboards'].findIndex((el: DashboardData) => el.type === D_TYPE.GA) : -1;
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

        this.GEService.addSubscriber(dash_type);
      }

      await this.loadDashboard();

      this.userService.logger(2, this.user).subscribe();

    } catch (e) {
      console.error('Error on ngOnInit of Google Analytics', e);
    }
  }

  async loadDashboard() {

    let dash, charts, dataArray, chartParams: ChartParams = {};
    const observables: Observable<any>[] = [];
    const chartsToShow: Array<DashboardCharts> = [];
    const dateInterval: IntervalDate = {
      first: this.minDate,
      last: this.maxDate
    };
    const currentData: DashboardData = {
      data: chartsToShow,
      interval: dateInterval,
      type: D_TYPE.GA,
    };
    let chart: DashboardCharts;

    this.GEService.loadingScreen.next(true);

    this.dragulaService.find('REVERT');

    try {
      // Retrieving dashboard ID
      dash = await this.DService.getDashboardByType(D_TYPE.GA).toPromise(); // Google type

      if (dash.id) {
        this.HARD_DASH_DATA.dashboard_id = dash.id; // Retrieving dashboard id
      } else {
        console.error('Cannot retrieve a valid ID for the Website dashboard.');
        return;
      }

      this.dashErrors.emptyMiniCards = await this.loadMiniCards();

      if (this.dashStored) {
        // Ci sono già dati salvati
        this.filterActions.loadStoredDashboard(D_TYPE.GA);
        this.bsRangeValue = [subDays(this.maxDate, this.FILTER_DAYS.thirty), this.lastDateRange];
        this.GEService.loadingScreen.next(false);

        if (this.chartArray$.length === 0) {
          this.toastr.info('Puoi iniziare aggiungendo un nuovo grafico.', 'La tua dashboard è vuota');
          //this.toastr.info('Puoi iniziare aggiungendo un nuovo grafico.','La tua dashboard è vuota');

          this.toastr.info(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'VUOTA'),
            this.GEService.getStringToastr(true, false, 'DASHBOARD', 'VUOTA'));
        }

      } else {
        charts = await this.DService.getAllDashboardCharts(this.HARD_DASH_DATA.dashboard_id).toPromise();

        if (charts && charts.length > 0) { // Checking if dashboard is not empty
          charts.forEach(chartEl => {
            chartParams = {
              metric: chartEl.metric,
              dimensions: chartEl.dimensions,
              filter: chartEl.filter,
              sort: chartEl.sort
            };
            observables.push(this.CCService.retrieveChartData(chartEl.type, chartParams));
          }); // Retrieves data for each chart

          dataArray = await forkJoin(observables).toPromise();

          for (let i = 0; i < dataArray.length; i++) {
            chart = charts[i];
            if (dataArray[i] && !dataArray[i].status && chart) { // If no error is occurred when retrieving chart data
              chart.chartData = dataArray[i];
              let date = parseDate(chart['chartData'][0][0]);

              if (date < this.minDate) {
                this.minDate = date;
              }

              chart.error = false;
            } else {
              chart.error = true;
              console.error('ERROR in Google Analytics COMPONENT. The chart data is undefined or it\'s not possible to retrieve data from the chart ', chart, '. More info:');
              console.error(dataArray[i]);
            }

            chartsToShow.push(chart);
          }

          currentData.data = chartsToShow;

          this.filterActions.initData(currentData);
          this.GEService.updateChartList.next(true);

          // Shows last 30 days
          // this.datePickerEnabled = true;
          this.bsRangeValue = [subDays(this.maxDate, this.FILTER_DAYS.thirty), this.lastDateRange];

          this.GEService.loadingScreen.next(false);


        } else {
          this.filterActions.initData(currentData);
          this.GEService.loadingScreen.next(false);
          //this.toastr.info('Puoi iniziare aggiungendo un nuovo grafico.','La tua dashboard è vuota');

          this.toastr.info(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'VUOTA'),
            this.GEService.getStringToastr(true, false, 'DASHBOARD', 'VUOTA'));
        }
      }

      this.loaded = true;

    } catch (e) {
      //this.toastr.error('Il caricamento della dashboard non è andato a buon fine. Per favore, riprova oppure contatta il supporto tecnico.', 'Qualcosa è andato storto!');

      this.toastr.error(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'ERR_CARICAMENTO'),
        this.GEService.getStringToastr(true, false, 'DASHBOARD', 'ERR_CARICAMENTO'));
      console.error('ERROR in CUSTOM-COMPONENT. Cannot retrieve dashboard charts. More info:');
      console.error(e);
    }
  }

  async loadMiniCards() {
    // 1. Init intervalData (retrieve data of previous month)
    let results;
    let empty = false;
    const date = new Date();
    const y = date.getFullYear();
    const m = date.getMonth();

    const intervalDate: IntervalDate = {
      first: new Date(y, m, 1),
      last: new Date(new Date(y, m + 1, 0).setHours(23, 59, 59, 999))
    };

    const observables = this.CCService.retrieveMiniChartData(D_TYPE.GA, null, intervalDate);

    forkJoin(observables).subscribe(miniDatas => {
      for (const i in miniDatas) {
        results = this.CCService.formatMiniChartData(miniDatas[i], D_TYPE.GA, this.miniCards[i].measure);

        this.getNameMinicard(i);
        this.miniCards[i].value = results['value'];
        this.miniCards[i].progress = results['perc'] + '%';
        this.miniCards[i].step = results['step'];

        empty = empty || !results;
      }
    });
    return empty;
  }

  addChartToDashboard(dashChart: DashboardCharts) {
    const chartToPush: DashboardCharts = dashChart;
    const chartParams: ChartParams = {
      metric: dashChart.metric,
      dimensions: dashChart.dimensions,
      sort: dashChart.sort,
      filter: dashChart.filter
    };
    const dateInterval: IntervalDate = {
      first: this.bsRangeValue[0],
      last: this.bsRangeValue[1]
    };

    this.CCService.retrieveChartData(dashChart.type, chartParams)
      .subscribe(chartData => {

        this.GEService.loadingScreen.next(true);

        if (chartData && !chartData['status']) { // Se la chiamata non rende errori
          chartToPush.chartData = chartData;
          chartToPush.error = false;

          this.toastr.success(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'ADD'),
            this.GEService.getStringToastr(true, false, 'DASHBOARD', 'ADD'));
        } else {
          chartToPush.error = true;
          console.error('Errore recuperando dati per ' + dashChart);

          this.toastr.error('"' + dashChart.title + this.GEService.getStringToastr(false, true, 'DASHBOARD', 'NO_DATI'),
            this.GEService.getStringToastr(true, false, 'DASHBOARD', 'NO_DATI'));
        }

        this.filterActions.addChart(chartToPush);
        this.filterActions.filterData(dateInterval);

        this.GEService.loadingScreen.next(false);
      }, error1 => {
        console.error('Error querying the Chart');
        console.error(error1);

        this.toastr.error('"' + dashChart.title + this.GEService.getStringToastr(false, true, 'DASHBOARD', 'NO_DATI_1'),
          this.GEService.getStringToastr(true, false, 'DASHBOARD', 'NO_DATI_1'));
      });
  }

  onValueChange(value): void {

    if (value) {// && this.datePickerEnabled) {

      const dateInterval: IntervalDate = {
        first: new Date(value[0].setHours(0, 0, 0, 0)), // TO REMEMBER: always set ms to 0!!!!
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

    //console.log(this.GEService.getStringBreadcrumb('SITO_WEB'));

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

  clearDashboard(): void {
    this.DService.clearDashboard(this.HARD_DASH_DATA.dashboard_id).subscribe(() => {
      this.filterActions.clearDashboard(D_TYPE.GA);
      this.closeModal();
    }, error => {
      console.error(error);
      this.closeModal();

      if (error.status === 500) {

        this.toastr.error(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'NO_CLEAR'),
          this.GEService.getStringToastr(true, false, 'DASHBOARD', 'NO_CLEAR'));
      } else {

        this.toastr.error(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'NO_RIMOZIONE'),
          this.GEService.getStringToastr(true, false, 'DASHBOARD', 'NO_RIMOZIONE'));
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
    pdf.text('REPORT DASHBOARD SITO', x, y - 5);
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

    pdf.save('report_sito_' + user.username + '_' + day + '-' + month + '-' + year + '.pdf');

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

  async selectViewSubmit() {
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


    try {
      update = await this.apiKeyService.updateKey(key).toPromise();
      if (update) {
        this.closeModal();
        //        await this.ngOnInit();
        location.reload();
      }
    } catch (e) {
      console.log(e);
    }
  }

  openModal(template: TemplateRef<any> | ElementRef, ignoreBackdrop: boolean = false) {
    this.drag = false;
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

  async checkExistance() {
    let response, isPermissionGranted, result = null;

    try {
      response = await this.apiKeyService.checkIfKeyExists(D_TYPE.GA).toPromise();
      isPermissionGranted = await this.apiKeyService.isPermissionGranted(D_TYPE.GA).toPromise();
      if (isPermissionGranted.tokenValid) {
        result = response['exists'] && isPermissionGranted['granted'];
      } else {

        this.toastr.error(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'ERR_PERMESSI'),
          this.GEService.getStringToastr(true, false, 'DASHBOARD', 'ERR_PERMESSI'));
      }

    } catch (e) {
      console.error(e);
    }

    return result;
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

      this.toastr.error(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'MOD_ORD'),
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
        this.filterActions.updateChartPosition(toUpdate, this.D_TYPE.GA);
        this.closeModal();
        this.drag = false;
        this.GEService.dragAndDrop.next(this.drag);

        this.toastr.error(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'SUC_ORD'),
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
              this.miniCards[id_minicard].name = this.GEService.getStringNameMinicard('GOOGLE', 'UT_TOT');
              break;
            case '1' :
              this.miniCards[id_minicard].name = this.GEService.getStringNameMinicard('GOOGLE', 'VISITE_TOT');
              break;
            case '2' :
              this.miniCards[id_minicard].name = this.GEService.getStringNameMinicard('GOOGLE', 'FREQ_RIMB');
              break;
            case '3' :
              this.miniCards[id_minicard].name = this.GEService.getStringNameMinicard('GOOGLE', 'DU_SES');
              break;
          }

        }, err => {
          console.error(err);
        });

    }, err => {
      console.error(err);
    });


  }

  async getViewName(viewid) {
    let viewName;
    try {
      viewName = _.find(this.viewList, {'id': viewid});
      return viewName.name;
    } catch (e) {
      console.log('errore get viewName', e);
    }
  }

  createForm() {
    this.selectViewForm = this.formBuilder.group({
      view_id: ['', Validators.compose([Validators.maxLength(20), Validators.required])],
    });
    this.selectViewForm.controls['view_id'].setValue(this.viewList[0].id);
  }


}
