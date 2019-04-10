import {Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FacebookService} from '../../../shared/_services/facebook.service';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {DashboardService} from '../../../shared/_services/dashboard.service';
import {ChartsCallsService} from '../../../shared/_services/charts_calls.service';
import {GlobalEventsManagerService} from '../../../shared/_services/global-event-manager.service';
import {DashboardCharts} from '../../../shared/_models/DashboardCharts';

import {subDays} from 'date-fns';
import {FilterActions} from '../redux-filter/filter.actions';
import {DashboardData, IntervalDate} from '../redux-filter/filter.model';
import {select} from '@angular-redux/store';
import {forkJoin, Observable} from 'rxjs';
import {ApiKeysService} from '../../../shared/_services/apikeys.service';

import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {User} from '../../../shared/_models/User';
import {UserService} from '../../../shared/_services/user.service';
import {ngxLoadingAnimationTypes} from 'ngx-loading';
import {D_TYPE} from '../../../shared/_models/Dashboard';
import {FbMiniCards, MiniCard} from '../../../shared/_models/MiniCard';
import {ToastrService} from 'ngx-toastr';
import {BsLocaleService, BsModalRef, BsModalService} from 'ngx-bootstrap';

const PrimaryWhite = '#ffffff';

@Component({
  selector: 'app-feature-dashboard-facebook',
  templateUrl: './facebook.component.html'
})

export class FeatureDashboardFacebookComponent implements OnInit, OnDestroy {

  @ViewChild('reportWait') reportWait;

  public D_TYPE = D_TYPE;
  public HARD_DASH_DATA = {
    dashboard_type: D_TYPE.FB,
    dashboard_id: null
  };

  private pageID = null;

  public FILTER_DAYS = {
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

  public loading = false;
  public isApiKeySet = true;
  modalRef: BsModalRef;

  @select() filter: Observable<any>;

  firstDateRange: Date;
  lastDateRange: Date;
  minDate: Date = new Date('2018-01-01');
  maxDate: Date = new Date();
  bsRangeValue: Date[];
  dateChoice: String = 'Ultimi 30 giorni';
  // datePickerEnabled = false; // Used to avoid calling onValueChange() on component init

  constructor(
    private FBService: FacebookService,
    private apiKeyService: ApiKeysService,
    private breadcrumbActions: BreadcrumbActions,
    private DService: DashboardService,
    private CCService: ChartsCallsService,
    private GEService: GlobalEventsManagerService,
    private filterActions: FilterActions,
    private userService: UserService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private localeService: BsLocaleService
  ) {

  }

  async loadMiniCards(pageID) {
    // 1. Init intervalData (retrieve data of previous month)
    let results;
    let date = new Date(), y = date.getFullYear(), m = date.getMonth();
    const intervalDate: IntervalDate = {
      first: new Date(y, m - 1, 1),
      last: new Date(new Date(y, m, 0).setHours(23, 59, 59, 999))
    };
    let pageIDs = {};

    pageIDs[D_TYPE.FB] = pageID;
    const observables = this.CCService.retrieveMiniChartData(D_TYPE.FB, pageIDs);


    forkJoin(observables).subscribe(miniDatas => {
      for(const i in miniDatas) {
        results = this.CCService.formatMiniChartData(miniDatas[i], D_TYPE.FB, this.miniCards[i].measure, intervalDate);
        this.miniCards[i].value = results['value'];
        this.miniCards[i].progress = results['perc'] + '%';
        this.miniCards[i].step = results['step'];
      }
    });
  }

  async loadDashboard() { // TODO get pageID and refactor
    const existence = await this.checkExistance();
    const observables: Observable<any>[] = [];
    const chartsToShow: Array<DashboardCharts> = [];
    const dateInterval: IntervalDate = {
      first: this.minDate,
      last: this.maxDate
    };
    let currentData: DashboardData = {
      data: chartsToShow,
      interval: dateInterval,
      type: D_TYPE.FB,
    };

    if (!existence) { // If the Api Key has not been set yet, then a message is print
      this.isApiKeySet = false;
      return;
    }

    this.GEService.loadingScreen.next(true);

    // Retrieving dashboard ID
    const dash = await this.DService.getDashboardByType(D_TYPE.FB).toPromise(); // Facebook type

    // Retrieving the page ID // TODO to move into onInit and its init on a dropdown
    this.pageID = (await this.FBService.getPages().toPromise())[0].id;

    await this.loadMiniCards(this.pageID);

    if (dash.id) {
      this.HARD_DASH_DATA.dashboard_id = dash.id; // Retrieving dashboard id
    } else {
      console.error('Cannot retrieve a valid ID for the Facebook dashboard.');
      return;
    }

    if (this.dashStored) {
      // Ci sono già dati salvati
      this.filterActions.loadStoredDashboard(D_TYPE.FB);
      this.bsRangeValue = [subDays(new Date(), this.FILTER_DAYS.thirty), this.lastDateRange];
      this.GEService.loadingScreen.next(false);

      console.log(this.bsRangeValue);
      // this.datePickerEnabled = true;
    } else {
      // Retrieving dashboard charts
      this.DService.getAllDashboardCharts(this.HARD_DASH_DATA.dashboard_id)
        .subscribe(charts => {

          if (charts && charts.length > 0) { // Checking if dashboard is not empty

            charts.forEach(chart => observables.push(this.CCService.retrieveChartData(chart.chart_id, this.pageID))); // Retrieves data for each chart
            forkJoin(observables)
              .subscribe(dataArray => {
                for (let i = 0; i < dataArray.length; i++) {

                  let chart: DashboardCharts = charts[i];
                  if (!dataArray[i].status && chart) { // If no error is occurred when retrieving chart data

                    chart.chartData = dataArray[i];
                    // chart.color = chart.chartData.options.color ? chart.chartData.options.colors[0] : null; TODO Check
                    chart.error = false;
                  } else {
                    chart.error = true;

                    console.error('ERROR in FACEBOOK COMPONENT. Cannot retrieve data from one of the charts. More info:');
                    console.error(dataArray[i]);
                  }

                  chartsToShow.push(chart); // Original Data
                }

                currentData.data = chartsToShow;

                this.filterActions.initData(currentData);
                this.GEService.updateChartList.next(true); // TODO check to remove

                // Shows last 30 days
                // this.datePickerEnabled = true;
                this.bsRangeValue = [subDays(new Date(), this.FILTER_DAYS.thirty), this.lastDateRange];

                this.GEService.loadingScreen.next(false);
              });

          } else {
            this.filterActions.initData(currentData);
            this.bsRangeValue = [subDays(new Date(), this.FILTER_DAYS.thirty), this.lastDateRange];
            this.GEService.loadingScreen.next(false);
            this.toastr.info('Puoi iniziare aggiungendo un nuovo grafico.','La tua dashboard è vuota');
          }
        }, err => {
          console.error('ERROR in FACEBOOK COMPONENT, when fetching charts.');
          console.warn(err);
        });

    }
  }

  addChartToDashboard(dashChart: DashboardCharts) {
    const chartToPush: DashboardCharts = dashChart;
    const intervalDate: IntervalDate = {
      first: this.bsRangeValue[0],
      last: this.bsRangeValue[1]
    };

    this.CCService.retrieveChartData(dashChart.chart_id, this.pageID)
      .subscribe(data => {

        this.GEService.loadingScreen.next(true);

        if (!data['status']) { // Se la chiamata non rende errori
          chartToPush.chartData = data;
          chartToPush.error = false;

          this.toastr.success('"' + dashChart.title + '" è stato correttamente aggiunto alla dashboard.', 'Grafico aggiunto!');

        } else {
          chartToPush.error = true;
          console.log('Errore recuperando dati per ' + dashChart);
        }

        this.filterActions.addChart(chartToPush);
        this.filterActions.filterData(intervalDate); // Dopo aver aggiunto un grafico, li porta tutti alla stessa data

        this.GEService.loadingScreen.next(false);
      }, error1 => {
        console.log('Error querying the chart');
        console.log(error1);
      });
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
    this.bsRangeValue = [subDays(new Date(), days), this.lastDateRange];

    switch (days) {
      case this.FILTER_DAYS.seven:
        this.dateChoice = 'Ultimi 7 giorni';
        break;
      case this.FILTER_DAYS.thirty:
        this.dateChoice = 'Ultimi 30 giorni';
        break;
      case this.FILTER_DAYS.ninety:
        this.dateChoice = 'Ultimi 90 giorni';
        break;
      default:
        this.dateChoice = 'Personalizzato';
        break;
    }
  }

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Dashboard', '/dashboard/'));
    bread.push(new Breadcrumb('Facebook', '/dashboard/facebook/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  async checkExistance() {
    let response, result;

    try {
      response = await this.apiKeyService.checkIfKeyExists(D_TYPE.FB).toPromise();
      result = response['exists'] && (await this.apiKeyService.isPermissionGranted(D_TYPE.FB).toPromise())['granted'];
    } catch (e) {
      console.error(e);
      result = null;
    }

    return result;
  }

  ngOnInit(): void {
    this.firstDateRange = this.minDate;
    this.lastDateRange = this.maxDate;
    this.bsRangeValue = [this.firstDateRange, this.lastDateRange];

    this.GEService.loadingScreen.subscribe(value => {this.loading = value});

    this.filter.subscribe(elements => {
      this.chartArray$ = elements['filteredDashboard'] ? elements['filteredDashboard']['data'] : [];
      const index = elements['storedDashboards'] ? elements['storedDashboards'].findIndex((el: DashboardData) => el.type === D_TYPE.FB) : -1;
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

    this.localeService.use('it');
    this.loadDashboard();
    this.addBreadcrumb();
  }

  ngOnDestroy() {
    this.removeBreadcrumb();
    this.filterActions.removeCurrent();
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
    return <User> await this.userService.get().toPromise();
  }

  nChartEven() {
    return this.chartArray$.length % 2 === 0;
  }

  openModal(template: TemplateRef<any> | ElementRef, ignoreBackdrop: boolean = false) {
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered', ignoreBackdropClick: ignoreBackdrop, keyboard: !ignoreBackdrop});
  }

  closeModal() {
    this.modalRef.hide();
  }
}
