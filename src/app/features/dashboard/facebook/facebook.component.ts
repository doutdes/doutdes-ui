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

  public chartArray$: Array<DashboardCharts> = [];

  public loading = false;
  public isApiKeySet = true;
  public emptyCardStyle = {
    'padding-left': '0px',
    'paddin-right': '0px'
  };

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
    private filterActions: FilterActions
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
    this.pageID = (await this.FBService.getPages().toPromise())[0].id;

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

                  // Cleaning data // TODO this should be fixed at mount
                  chart.format = chart['Chart'].format;
                  chart.type = chart['Chart'].type;
                  chart.originalTitle = chart['Chart'].title;
                  delete chart['Chart'];

                  chart.chartData = this.CCService.formatChart(charts[i].chart_id, dataArray[i]);
                  chart.color = chart.chartData.options.color ? chart.chartData.options.colors[0] : null;
                  chart.error = false;

                  if (this.CCService.containsGeoData(chart)) { // Add field geoData for charts with geographical data
                    chart.geoData = dataArray[i];
                  }

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
          chartToPush.chartData = this.CCService.formatChart(dashChart.chart_id, data);
          chartToPush.color = chartToPush.chartData.chartType === 'Table' ? null : chartToPush.chartData.options.colors[0];
          chartToPush.error = false;
          chartToPush.type = dashChart.type;
          chartToPush.format = dashChart.format;
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

  cloneChart(chart: DashboardCharts): DashboardCharts {

    return JSON.parse(JSON.stringify(chart));
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

  nChartEven(){
    return this.chartArray$.length % 2 === 0;
  }
}
