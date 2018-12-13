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
import {ngxLoadingAnimationTypes} from 'ngx-loading';
import {Chart} from '../../../shared/_models/Chart';

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
    private FBService: FacebookService,
    private breadcrumbActions: BreadcrumbActions,
    private DService: DashboardService,
    private CCService: ChartsCallsService,
    private GEService: GlobalEventsManagerService,
    private filterActions: FilterActions
  ) {
    this.GEService.removeFromDashboard.subscribe(values => {
      if (values[0] !== 0 && values[1] === this.HARD_DASH_DATA.dashboard_id) {
        this.filterActions.removeChart(values[0]);
        this.GEService.removeFromDashboard.next([0, 0]);
      }
    });
    this.GEService.addChartInDashboard.subscribe(chart => {
      if (chart && chart.dashboard_id === this.HARD_DASH_DATA.dashboard_id) {
        this.addChartToDashboard(chart);
        this.GEService.addChartInDashboard.next(null);
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

    this.firstDateRange = this.minDate;
    this.lastDateRange = this.maxDate;
    this.bsRangeValue = [this.firstDateRange, this.lastDateRange];

    this.filter.subscribe(elements => {
      if (elements['dataFiltered'] !== null) {
        this.chartArray$ = elements['dataFiltered'];
      }
    });
  }

  loadDashboard() {

    const observables: Observable<any>[] = [];
    const chartsToShow: Array<DashboardCharts> = [];
    const chartsClone: Array<DashboardCharts> = [];

    this.GEService.loadingScreen.next(true);

    this.DService.getDashboardByType(this.HARD_DASH_DATA.dashboard_type)
      .subscribe(charts => {

        if (charts['dashboard_id']) {
          this.HARD_DASH_DATA.dashboard_id = charts['dashboard_id'];
        } else {
          this.HARD_DASH_DATA.dashboard_id = charts[0].dashboard_id;
        }

        if(charts instanceof Array) {
          charts.forEach(chart => observables.push(this.CCService.retrieveChartData(chart.chart_id)));

          forkJoin(observables)
            .subscribe(dataArray => {
              for (let i = 0; i < dataArray.length; i++) {

                let chart: DashboardCharts = charts[i];

                // Cleaning data
                chart.format = chart['Chart'].format;
                chart.type = chart['Chart'].type;
                chart.originalTitle = chart['Chart'].title;
                delete chart['Chart'];

                let cloneChart: DashboardCharts;

                if (!dataArray[i].status) { // If no error is occurred when retrieving chart data

                  // TODO: filter data
                  chart.chartData = this.CCService.formatChart(charts[i].chart_id, dataArray[i]);
                  chart.color = chart.chartData.options.colors[0] || null;
                  chart.error = false;

                  // Handling geomap data (different from standard data) TODO check this
                  if (chart.format === 'geomap') {
                    chart.geoData = dataArray[i];
                  }

                } else {
                  chart.error = true;

                  console.log('ERROR in FACEBOOK COMPONENT. Cannot retrieve data from one of the charts. More info:');
                  console.log(dataArray[i]);
                }

                cloneChart = this.createClone(chart);

                chartsToShow.push(chart); // Original Data
                chartsClone.push(cloneChart);  // Filtered Data TODO we need this?
              }
              this.GEService.loadingScreen.next(false);

              const dateInterval: IntervalDate = {
                dataStart: this.minDate,
                dataEnd: this.maxDate
              };

              this.filterActions.initData(chartsToShow, chartsClone, dateInterval);
              this.filterActions.filterData(dateInterval);
              this.GEService.updateChartList.next(true);
            });

        } else {
          this.GEService.loadingScreen.next(false);
        }
      }, err => {
        console.log('ERROR in FACEBOOK COMPONENT, when fetching charts.');
        console.log(err);
      });
  }

  addChartToDashboard(dashChart: DashboardCharts) {
    const chartToPush: DashboardCharts = dashChart;

    const intervalDate: IntervalDate = {
      dataStart: this.bsRangeValue[0],
      dataEnd: this.bsRangeValue[1]
    };

    this.CCService.retrieveChartData(dashChart.chart_id)
      .subscribe(data => {

        if (!data['status']) { // Se la chiamata non rende errori
          //chartToPush.Chart = innerChart;
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

    if (value) {
      const dateInterval: IntervalDate = {
        dataStart: value[0],
        dataEnd: value[1].setHours(23, 59, 59, 999)
      };

      console.log('ON VALUE CHANGE:');
      console.log(dateInterval);
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

  createClone(chart: DashboardCharts): DashboardCharts {

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

  ngOnInit(): void {
    this.loadDashboard();
    this.addBreadcrumb();
  }

  ngOnDestroy() {
    this.removeBreadcrumb();
    this.filterActions.clear();
  }
}
