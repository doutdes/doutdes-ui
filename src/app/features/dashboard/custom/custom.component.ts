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
import {IntervalDate} from '../redux-filter/filter.model';
import {subDays} from 'date-fns';
import {ngxLoadingAnimationTypes} from 'ngx-loading';
import {Chart} from '../../../shared/_models/Chart';
import {FacebookService} from '../../../shared/_services/facebook.service';
import {AggregatedDataService} from '../../../shared/_services/aggregated-data.service';

const PrimaryWhite = '#ffffff';

@Component({
  selector: 'app-feature-dashboard-custom',
  templateUrl: './custom.component.html'
})

export class FeatureDashboardCustomComponent implements OnInit, OnDestroy {

  public HARD_DASH_DATA = {
    dashboard_type: 0,
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

  constructor(
    private GAService: GoogleAnalyticsService,
    private FBService: FacebookService,
    private breadcrumbActions: BreadcrumbActions,
    private DService: DashboardService,
    private CCService: ChartsCallsService,
    private GEService: GlobalEventsManagerService,
    private filterActions: FilterActions,
    private ADService: AggregatedDataService
  ) {
    this.firstDateRange = this.minDate;
    this.lastDateRange = this.maxDate;
    this.bsRangeValue = [this.firstDateRange, this.lastDateRange];

    this.filter.subscribe(elements => {
      if (elements['dataFiltered'] !== null) {
        this.chartArray$ = elements['dataFiltered'];
      }
    });
  }

  async loadDashboard() {

    const observables: Observable<any>[] = [];
    const chartsToShow: Array<DashboardCharts> = [];

    this.GEService.loadingScreen.next(true);

    // Retrieving dashboard ID
    const dash = await this.DService.getDashboardByType(0).toPromise(); // Custom dashboard type

    // Retrieving the page ID // TODO to add the choice of the page, now it takes just the first one
    this.pageID = (await this.FBService.getPages().toPromise())[1].id;


    if (dash.id) {
      this.HARD_DASH_DATA.dashboard_id = dash.id; // Retrieving dashboard id
    }
    else {
      console.error('Cannot retrieve a valid ID for the Facebook dashboard.');
      return;
    }

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
                  chart.aggregated = this.ADService.getAggregatedData(dataArray[i], charts[i].chart_id);
                } else {

                  chart.error = true;

                  console.error('ERROR in CUSTOM-COMPONENT. Cannot retrieve data from one of the charts. More info:');
                  console.error(dataArray[i]);
                }

                chartsToShow.push(chart);
              }
              this.GEService.loadingScreen.next(false);

              const dateInterval: IntervalDate = {
                dataStart: this.minDate,
                dataEnd: this.maxDate
              };

              this.filterActions.initData(chartsToShow, dateInterval);
              this.GEService.updateChartList.next(true);

              // Shows last 30 days
              //this.bsRangeValue = [subDays(new Date(), this.FILTER_DAYS.thirty), this.lastDateRange];
            });

        } else {
          this.GEService.loadingScreen.next(false);
        }
      }, err => {
        console.error('ERROR in CUSTOM-COMPONENT. Cannot retrieve dashboard charts. More info:');
        console.log(err);
      });
  }

  addChartToDashboard(dashChart: DashboardCharts) {
    const chartToPush: DashboardCharts = dashChart;

    const intervalDate: IntervalDate = {
      dataStart: this.bsRangeValue[0],
      dataEnd: this.bsRangeValue[1]
    };

    this.CCService.retrieveChartData(dashChart.chart_id, this.pageID, intervalDate)
      .subscribe(chartData => {

        if (!chartData['status']) { // Se la chiamata non rende errori

          chartToPush.chartData = this.CCService.formatChart(dashChart.chart_id, chartData);
          chartToPush.color = chartToPush.chartData.chartType === 'Table' ? null : chartToPush.chartData.options.colors[0];
          chartToPush.error = false;
          chartToPush.aggregated = this.ADService.getAggregatedData(chartData, dashChart.chart_id);

          console.log(chartToPush);
        } else {
          chartToPush.error = true;
          console.log('Errore recuperando dati per ' + dashChart);
        }

        console.log('ADD-CHART-TO-DASHBORD:');
        console.log(chartToPush);
        this.filterActions.addChart(chartToPush);
      }, error1 => {
        console.log('Error querying the Chart');
        console.log(error1);
      });
  }

  onValueChange(value): void {
    if (value) {
      const dateInterval: IntervalDate = {
        dataStart: value[0],
        dataEnd: value[1].setHours(23, 59, 59, 999)
      };
      this.GEService.loadingScreen.next(true);
      this.filterActions.filterData(dateInterval);
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
    this.addBreadcrumb();
    let promise = this.loadDashboard();

    this.GEService.removeFromDashboard.subscribe(values => {
      if (values[0] !== 0 && values[1] === this.HARD_DASH_DATA.dashboard_id) {
        this.filterActions.removeChart(values[0]);
        this.GEService.removeFromDashboard.next([0, 0]);
      }
    });
    this.GEService.showChartInDashboard.subscribe(chart => {
      if (chart && chart.dashboard_id === this.HARD_DASH_DATA.dashboard_id) {
        this.addChartToDashboard(chart);
        this.GEService.showChartInDashboard.next(null);
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
  }

  ngOnDestroy() {
    this.removeBreadcrumb();
    this.filterActions.clear();
  }
}
