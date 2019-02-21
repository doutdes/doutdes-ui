import {Component, OnDestroy, OnInit} from '@angular/core';
import {FacebookService} from '../../../shared/_services/facebook.service';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {DashboardService} from '../../../shared/_services/dashboard.service';
import {ChartsCallsService} from '../../../shared/_services/charts_calls.service';
import {GlobalEventsManagerService} from '../../../shared/_services/global-event-manager.service';
import {DashboardCharts} from '../../../shared/_models/DashboardCharts';

import {subDays} from 'date-fns';
import {FilterActions} from '../redux-filter/filter.actions';
import {IntervalDate} from '../redux-filter/filter.model';
import {select} from '@angular-redux/store';
import {forkJoin, Observable} from 'rxjs';
import {ApiKeysService} from '../../../shared/_services/apikeys.service';

import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {User} from '../../../shared/_models/User';
import {UserService} from '../../../shared/_services/user.service';
import {ngxLoadingAnimationTypes} from 'ngx-loading';

const PrimaryWhite = '#ffffff';

@Component({
  selector: 'app-feature-dashboard-facebook',
  templateUrl: './facebook.component.html'
})

export class FeatureDashboardFacebookComponent implements OnInit, OnDestroy {

  public HARD_DASH_DATA = {
    dashboard_type: 1,
    dashboard_id: null
  };

  private pageID = null;

  public FILTER_DAYS = {
    seven: 7,
    thirty: 30,
    ninety: 90
  };

  public config = {
    animationType: ngxLoadingAnimationTypes.threeBounce,
    backdropBackgroundColour: 'rgba(0,0,0,0.1)',
    backdropBorderRadius: '4px',
    primaryColour: PrimaryWhite,
    secondaryColour: PrimaryWhite
  };

  public chartArray$: Array<DashboardCharts> = [];

  public loading = false;
  public isApiKeySet = true;

  @select() filter: Observable<any>;

  firstDateRange: Date;
  lastDateRange: Date;
  minDate: Date = new Date('2018-01-01');
  maxDate: Date = new Date();
  bsRangeValue: Date[];
  dateChoice: String = 'Preset';
  datePickerEnabled = false; // Used to avoid calling onValueChange() on component init

  constructor(
    private FBService: FacebookService,
    private apiKeyService: ApiKeysService,
    private breadcrumbActions: BreadcrumbActions,
    private DService: DashboardService,
    private CCService: ChartsCallsService,
    private GEService: GlobalEventsManagerService,
    private filterActions: FilterActions,
    private userService: UserService
  ) {

  }

  async loadDashboard() {
    const existence = await this.checkExistance();
    const observables: Observable<any>[] = [];
    const chartsToShow: Array<DashboardCharts> = [];

    if(!existence['exists']) { // If the Api Key has not been set yet, then a message is print
      this.isApiKeySet = false;
      return;
    }

    this.GEService.loadingScreen.next(true);

    // Retrieving dashboard ID
    const dash = await this.DService.getDashboardByType(1).toPromise(); // Facebook type

    // Retrieving the page ID // TODO to add the choice of the page, now it takes just the first one
    this.pageID = (await this.FBService.getPages().toPromise())[4].id;

    if (dash.id) {
      this.HARD_DASH_DATA.dashboard_id = dash.id; // Retrieving dashboard id
    }
    else {
      console.error('Cannot retrieve a valid ID for the Facebook dashboard.');
      return;
    }

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
              this.GEService.loadingScreen.next(false);

              const dateInterval: IntervalDate = {
                first: this.minDate,
                last: this.maxDate
              };

              this.filterActions.initData(chartsToShow, dateInterval);
              this.GEService.updateChartList.next(true);

              // Shows last 30 days
              this.datePickerEnabled = true;
              this.bsRangeValue = [subDays(new Date(), this.FILTER_DAYS.thirty), this.lastDateRange];
            });

        } else {
          this.GEService.loadingScreen.next(false);
          console.log('Dashboard is empty.');
        }
      }, err => {
        console.error('ERROR in FACEBOOK COMPONENT, when fetching charts.');
        console.warn(err);
      });
  }

  addChartToDashboard(dashChart: DashboardCharts) {
    const chartToPush: DashboardCharts = dashChart;
    const intervalDate: IntervalDate = {
      first: this.bsRangeValue[0],
      last: this.bsRangeValue[1]
    };

    this.CCService.retrieveChartData(dashChart.chart_id, this.pageID)
      .subscribe(data => {

        if (!data['status']) { // Se la chiamata non rende errori
          chartToPush.chartData = data;
          // chartToPush.color = chartToPush.chartData.chartType === 'Table' ? null : chartToPush.chartData.options.colors[0];
          chartToPush.error = false;
        } else {
          chartToPush.error = true;
          console.log('Errore recuperando dati per ' + dashChart);
        }

        this.filterActions.addChart(chartToPush);
        this.filterActions.filterData(intervalDate); // Dopo aver aggiunto un grafico, li porta tutti alla stessa data
      }, error1 => {
        console.log('Error querying the chart');
        console.log(error1);
      });
  }

  onValueChange(value): void {

    if (value && this.datePickerEnabled) {

      const dateInterval: IntervalDate = {
        first: new Date(value[0].setHours(0, 0, 0)),
        last: new Date(value[1].setHours(23, 59, 59))
      };

      this.filterActions.filterData(dateInterval);

      let diff = Math.abs(dateInterval.first.getTime() - dateInterval.last.getTime());
      let diffDays = Math.ceil(diff / (1000 * 3600 * 24));

      if (diffDays != 8 && diffDays != 31 && diffDays != 91) {
        this.dateChoice = 'Custom';
      }
    }
  }

  changeDateFilter(days: number) {
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
    bread.push(new Breadcrumb('Facebook', '/dashboard/facebook/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  async checkExistance() {
    let response = null;

    try {
      response = await this.apiKeyService.checkIfKeyExists(0).toPromise();
    } catch (e) {
      console.error(e);
    }

    return response;
  }

  ngOnInit(): void {
    this.firstDateRange = this.minDate;
    this.lastDateRange = this.maxDate;
    this.bsRangeValue = [this.firstDateRange, this.lastDateRange];

    this.filter.subscribe(elements => {
      if (elements['dataFiltered'] !== null) {
        this.chartArray$ = elements['dataFiltered'];
      }
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
          const index = this.chartArray$.findIndex((chartToUpdate) => chartToUpdate.chart_id === chart.chart_id);
          this.filterActions.updateChart(index, chart.title);
        }
      });
      this.GEService.loadingScreen.subscribe(value => {
        this.loading = value;
      });

      this.GEService.addSubscriber(dash_type);
    }

    this.loadDashboard();
    this.addBreadcrumb();
  }

  ngOnDestroy() {
    this.removeBreadcrumb();
    this.filterActions.clear();
  }

  async htmltoPDF() {
    const pdf = new jsPDF('p', 'px', 'a4');// 595w x 842h
    const cards = document.querySelectorAll('app-card');

    const firstCard = await html2canvas(cards[0]);
    let dimRatio = firstCard['width'] > 400 ? 3 : 2;
    let graphsRow = 2;
    let graphsPage = firstCard['width'] > 400 ? 6 : 4;
    let x = 20, y = 40;

    pdf.setFontSize(12);
    pdf.text('Doutdes for ' + await this.getUserCompany(), 340, 10);

    console.warn('Rapporto dimensioni: ' + dimRatio);
    console.warn('Grafici per riga: ' + graphsRow);

    pdf.setFontSize(30);
    pdf.text('Facebook Pages', x, y);
    y += 20;

    pdf.setFontSize(20);
    pdf.text('Date interval: ' + this.formatStringDate(this.bsRangeValue[0]) + ' - ' + this.formatStringDate(this.bsRangeValue[1]), x, y);
    y += 20;

    // Numero grafici per riga dipendente da dimensioni grafico
    for (let i = 0; i < cards.length; i++) {
      const canvas = await html2canvas(cards[i]);
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      if (i !== 0 && i % graphsRow === 0 && i !== graphsPage) {
        y += canvas.height / dimRatio + 20;
        x = 20;
      }

      if(i !== 0 && i % graphsPage === 0) {
        pdf.addPage();
        x = 20;
        y = 20;
      }

      pdf.addImage(imgData, x, y, canvas.width / dimRatio, canvas.height / dimRatio);
      x += canvas.width / dimRatio + 10;
    }

    pdf.save('fb_report.pdf');
  }

  formatStringDate(date: Date) {
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }

  async getUserCompany() {
    const user: User  = await this.userService.get().toPromise();

    return user.company_name;
  }

  nChartEven(){
    return this.chartArray$.length % 2 === 0;
  }
}
