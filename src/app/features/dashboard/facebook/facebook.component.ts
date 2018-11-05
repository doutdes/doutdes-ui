import {Component, OnDestroy, OnInit} from '@angular/core';
import {FacebookService} from '../../../shared/_services/facebook.service';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {DashboardService} from '../../../shared/_services/dashboard.service';
import {ChartsCallsService} from '../../../shared/_services/charts_calls.service';
import {GlobalEventsManagerService} from '../../../shared/_services/global-event-manager.service';
import {DashboardCharts} from '../../../shared/_models/DashboardCharts';

import {subDays, addDays} from 'date-fns';
import {FilterActions} from '../redux-filter/filter.actions';
import {IntervalDate} from '../redux-filter/filter.model';
import {select} from '@angular-redux/store';
import {Observable} from 'rxjs';

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

  @select() filter: Observable<any>;

  firstDateRange: Date;
  lastDateRange: Date;
  minDate: Date = new Date('2018-01-01');
  maxDate: Date = new Date();
  bsRangeValue: Date[];
  dateChoice: String = 'Preset';

  constructor(
    private facebookService: FacebookService,
    private breadcrumbActions: BreadcrumbActions,
    private dashboardService: DashboardService,
    private chartsCallService: ChartsCallsService,
    private globalEventService: GlobalEventsManagerService,
    private filterActions: FilterActions
  ) {
    this.globalEventService.removeFromDashboard.subscribe(id => {
      if(id !== 0 ){
        this.chartArray$ = this.chartArray$.filter((chart) => chart.chart_id !== id);
        this.globalEventService.removeFromDashboard.next(0);
      }
    });
    this.globalEventService.addChartInDashboard.subscribe(chart => {
      if(chart) {
        this.addChartToDashboard(chart);
        this.globalEventService.addChartInDashboard.next(null);
      }
    });
    this.globalEventService.updateChartInDashboard.subscribe(chart => {
      if(chart) {
        const index = this.chartArray$.findIndex((chartToUpdate) => chartToUpdate.chart_id === chart.chart_id);
        this.chartArray$[index].title = chart.title;
      }
    });

    this.firstDateRange = this.minDate;
    this.lastDateRange = this.maxDate;
    this.bsRangeValue = [this.firstDateRange, this.lastDateRange];

    this.filter.subscribe(elements => {
      if(elements['dataFiltered'] !== null) {
        this.chartArray$ = elements['dataFiltered'];
      }
    });
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.addBreadcrumb();
  }

  loadDashboard() {
    this.dashboardService.getDashboardByType(this.HARD_DASH_DATA.dashboard_type)
      .subscribe(dashCharts => {

        if(dashCharts['dashboard_id']){
          this.HARD_DASH_DATA.dashboard_id = dashCharts['dashboard_id'];
        } else {
          this.HARD_DASH_DATA.dashboard_id = dashCharts[0].dashboard_id;

          dashCharts.forEach(chart => this.addChartToDashboard(chart));
        }

        let dateInterval: IntervalDate = {
          dataStart: this.firstDateRange,
          dataEnd: this.lastDateRange
        };
        this.filterActions.initData(this.chartArray$, dateInterval);

        this.globalEventService.updateChartList.next(true);

      }, error1 => {
        console.log('Error querying the charts of the Facebook Dashboard');
        console.log(error1);
      });
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

  ngOnDestroy() {
    this.removeBreadcrumb();
    this.filterActions.clear();
  }

  addChartToDashboard(chart: DashboardCharts) { // TODO Gestire aggiunta tenendo conto di Redux
    const chartToPush: DashboardCharts = chart;

    this.chartsCallService.getDataByChartId(chart.chart_id)
      .subscribe(data => {

        chartToPush.chartData = this.chartsCallService.formatDataByChartId(chart.chart_id, data);
        chartToPush.color = chartToPush.chartData.options.colors[0];

        this.chartArray$.push(chartToPush);
      }, error1 => {
        console.log('Error querying the chart');
        console.log(error1);
      });
  }

  onValueChange(value): void {

    if(value) {
      const dateInterval: IntervalDate = {
        dataStart: value[0],
        dataEnd: value[1].setHours(23,59,59,999)
      };

      this.dateChoice = 'Custom';
      this.filterActions.filterData(dateInterval);
    }
  }

  changeData(days: number) {
    this.bsRangeValue = [subDays(new Date(), days), this.lastDateRange];

    const dateInterval: IntervalDate = {
      dataStart: subDays(new Date(), days),
      dataEnd: this.lastDateRange
    };
    this.filterActions.filterData(dateInterval);

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

}
