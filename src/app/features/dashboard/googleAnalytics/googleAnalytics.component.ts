import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {addDays, subDays} from 'date-fns';
import {AggregatedDataService} from '../../../shared/_services/aggregated-data.service';

import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {UserService} from '../../../shared/_services/user.service';
import {User} from '../../../shared/_models/User';
import {D_TYPE} from '../../../shared/_models/Dashboard';
import {GaMiniCards, MiniCard} from '../../../shared/_models/MiniCard';


@Component({
  selector: 'app-feature-dashboard-google',
  templateUrl: './googleAnalytics.component.html'
})

export class FeatureDashboardGoogleAnalyticsComponent implements OnInit, OnDestroy {

  public D_TYPE = D_TYPE;
  public HARD_DASH_DATA = {
    dashboard_type: D_TYPE.GA,
    dashboard_id: null
  };

  public FILTER_DAYS = {
    seven: 7,
    thirty: 30,
    ninety: 90
  };

  public chartArray$: Array<DashboardCharts> = [];
  public miniCards: MiniCard[] = GaMiniCards;
  private dashStored: DashboardData;

  public loading = false;

  @select() filter: Observable<any>;

  // Date variables
  firstDateRange: Date;
  lastDateRange: Date;
  minDate: Date = new Date('2018-01-01');
  maxDate: Date = new Date();
  bsRangeValue: Date[];
  dateChoice: String = 'Last 30 days';
  datePickerEnabled = false;


  constructor(
    private GAService: GoogleAnalyticsService,
    private breadcrumbActions: BreadcrumbActions,
    private DService: DashboardService,
    private CCService: ChartsCallsService,
    private GEService: GlobalEventsManagerService,
    private filterActions: FilterActions,
    private userService: UserService,
    private ADService: AggregatedDataService,
  ) {
  }

  async loadDashboard() { // TODO check api key existance

    await this.loadMiniCards();

    const observables: Observable<any>[] = [];
    const chartsToShow: Array<DashboardCharts> = [];
    let currentData: DashboardData;
    const dateInterval: IntervalDate = {
      first: this.minDate,
      last: this.maxDate
    };

    this.GEService.loadingScreen.next(true);

    // Retrieving dashboard ID
    const dash = await this.DService.getDashboardByType(2).toPromise(); // Google type

    if (dash.id) {
      this.HARD_DASH_DATA.dashboard_id = dash.id; // Retrieving dashboard id
    } else {
      console.error('Cannot retrieve a valid ID for the Website dashboard.');
      return;
    }

    if (this.dashStored) {
      // Ci sono già dati salvati
      this.filterActions.loadStoredDashboard(D_TYPE.GA);
      this.datePickerEnabled = true;
    } else {
      // Retrieving dashboard charts
      this.DService.getAllDashboardCharts(this.HARD_DASH_DATA.dashboard_id)
        .subscribe(charts => {

          if (charts && charts.length > 0) { // Checking if dashboard is not empty
            console.warn('Chart is not empty');
            charts.forEach(chart => observables.push(this.CCService.retrieveChartData(chart.chart_id))); // Retrieves data for each chart

            forkJoin(observables)
              .subscribe(dataArray => {
                for (let i = 0; i < dataArray.length; i++) {

                  let chart: DashboardCharts = charts[i];

                  if (!dataArray[i].status && chart) { // If no error is occurred when retrieving chart data

                    chart.chartData = dataArray[i];
                    // chart.chartData = this.CCService.formatChart(charts[i].chart_id, dataArray[i]);
                    // chart.color = chart.chartData.options.color ? chart.chartData.options.colors[0] : null; TODO to check
                    chart.error = false;
                    chart.aggregated = this.ADService.getAggregatedData(dataArray[i], charts[i].chart_id, dateInterval); // TODO export this to other dashboards
                  } else {

                    chart.error = true;

                    console.error('ERROR in GANALYTICS COMPONENT. Cannot retrieve data from one of the charts. More info:');
                    console.error(dataArray[i]);
                  }

                  chartsToShow.push(chart);
                }

                currentData = {
                  data: chartsToShow,
                  interval: dateInterval,
                  type: D_TYPE.GA,
                };

                this.filterActions.initData(currentData);
                this.GEService.updateChartList.next(true);

                // Shows last 30 days
                this.datePickerEnabled = true;
                this.bsRangeValue = [subDays(new Date(), this.FILTER_DAYS.thirty), this.lastDateRange];

                this.GEService.loadingScreen.next(false);

              });
          } else {
            this.GEService.loadingScreen.next(false);
            console.log('Dashboard is empty.');
          }

        }, err => {
          console.error('ERROR in CUSTOM-COMPONENT. Cannot retrieve dashboard charts. More info:');
          console.error(err);
        });
    }
  }

  async loadMiniCards() {
    // 1. Init intervalData (retrieve data of previous month)
    let results;
    let date = new Date(), y = date.getFullYear(), m = date.getMonth();

    const intervalDate: IntervalDate = {
      first: new Date(y, m - 1, 1),
      last: new Date(new Date(y, m, 0).setHours(23, 59, 59, 999))
    };

    const observables = this.CCService.retrieveMiniChartData(D_TYPE.GA, null, intervalDate);

    forkJoin(observables).subscribe(miniDatas => {
      for(const i in miniDatas) {
        results = this.CCService.formatMiniChartData(miniDatas[i], D_TYPE.GA, this.miniCards[i].measure);
        this.miniCards[i].value = results['value'];
        this.miniCards[i].progress = results['perc'] + '%';
        this.miniCards[i].step = results['step'];
      }
    });
  }

  addChartToDashboard(dashChart: DashboardCharts) {
    const chartToPush: DashboardCharts = dashChart;

    const dateInterval: IntervalDate = {
      first: this.bsRangeValue[0],
      last: this.bsRangeValue[1]
    };

    this.CCService.retrieveChartData(dashChart.chart_id, dateInterval)
      .subscribe(chartData => {
        console.log('GA COMPONENT ChartData');
        console.log(chartData);

        if (!chartData['status']) { // Se la chiamata non rende errori
          chartToPush.chartData = chartData;
          // chartToPush.color = chartToPush.chartData.chartType === 'Table' ? null : chartToPush.chartData.options.colors[0];
          chartToPush.error = false;
          chartToPush.aggregated = this.ADService.getAggregatedData(chartData, dashChart.chart_id, dateInterval);
        } else {
          chartToPush.error = true;
          console.error('Errore recuperando dati per ' + dashChart);
        }

        this.filterActions.addChart(chartToPush);
        this.filterActions.filterData(dateInterval); // TODO in theory, filterData should wait addChart before being executed
      }, error1 => {
        console.error('Error querying the Chart');
        console.error(error1);
      });
  }

  onValueChange(value): void {

    if (value && this.datePickerEnabled) {

      const dateInterval: IntervalDate = {
        first: new Date(addDays(value[0], 1).setHours(0, 0, 0)),
        last: new Date(addDays(value[1], 1).setHours(0, 0, 0))
      };

      this.filterActions.filterData(dateInterval);

      let diff = Math.abs(dateInterval.first.getTime() - dateInterval.last.getTime());
      let diffDays = Math.ceil(diff / (1000 * 3600 * 24));

      if (diffDays != 8 && diffDays != 31 && diffDays != 91) {
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
    bread.push(new Breadcrumb('Website', '/dashboard/google/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  ngOnInit(): void {

    this.firstDateRange = subDays(new Date(), 30); //this.minDate;
    this.lastDateRange = this.maxDate;
    //this.bsRangeValue = [this.firstDateRange, this.lastDateRange];
    this.bsRangeValue = [subDays(new Date(), 30), this.lastDateRange]; // Starts with Last 30 days

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
      this.GEService.loadingScreen.subscribe(value => {
        this.loading = value;
      });

      this.GEService.addSubscriber(dash_type);
    }

    this.addBreadcrumb();
    this.loadDashboard();
  }

  ngOnDestroy() {
    this.removeBreadcrumb();
    this.filterActions.removeCurrent();
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
    pdf.text('Google Analytics', x, y);
    y += 20;

    pdf.setFontSize(20);
    pdf.text('Date interval: ' + this.formatStringDate(this.bsRangeValue[0]) + ' - ' + this.formatStringDate(this.bsRangeValue[1]), x, y);
    y += 20;

    // Numero grafici per riga dipendente da dimensioni grafico
    // width > 400: 2 per riga, dimensione / 3
    // 200 <= width <= 400: 3 per riga, dimensione / 2

    for (let i = 0; i < cards.length; i++) {
      const canvas = await html2canvas(cards[i]);
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      console.warn('Width: ' + canvas.width + ', height: ' + canvas.height);

      if (i !== 0 && i % graphsRow === 0 && i !== graphsPage) {
        console.warn('Ci sono già ' + (i / graphsRow) + ' grafici in una riga');
        y += canvas.height / dimRatio + 20;
        x = 20;
      }

      if (i !== 0 && i % graphsPage === 0) {
        pdf.addPage();
        x = 20;
        y = 20;
      }

      pdf.addImage(imgData, x, y, canvas.width / dimRatio, canvas.height / dimRatio);
      x += canvas.width / dimRatio + 10;

      console.warn('x -> ' + x);
      console.warn('y -> ' + y);

    }

    pdf.save('website_report.pdf');
  }

  formatStringDate(date: Date) {
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }

  async getUserCompany() {
    let company = null;
    const user: User = await this.userService.get().toPromise();

    return user.company_name;
  }

  nChartEven() {
    return this.chartArray$.length % 2 === 0;
  }
}
