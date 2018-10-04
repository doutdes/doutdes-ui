import {Component, OnDestroy, OnInit} from '@angular/core';
import {FacebookService} from '../../../shared/_services/facebook.service';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {DashboardService} from '../../../shared/_services/dashboard.service';
import {ChartsCallsService} from '../../../shared/_services/charts_calls.service';
import {GlobalEventsManagerService} from '../../../shared/_services/global-event-manager.service';
import {DashboardCharts} from '../../../shared/_models/DashboardCharts';

@Component({
  selector: 'app-feature-dashboard-facebook',
  templateUrl: './facebook.component.html'
})

export class FeatureDashboardFacebookComponent implements OnInit, OnDestroy {

  public HARD_DASH_DATA = {
    dashboard_type: 1,
    dashboard_id: null
  };
  public chartArray$: Array<DashboardCharts> = [];

  constructor(
    private facebookService: FacebookService,
    private breadcrumbActions: BreadcrumbActions,
    private dashboardService: DashboardService,
    private chartsCallService: ChartsCallsService,
    private globalEventService: GlobalEventsManagerService
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
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.addBreadcrumb();
  }

  loadDashboard() {
    this.dashboardService.getDashboardByType(1)
      .subscribe(dashCharts => {

        if(dashCharts['dashboard_id']){
          this.HARD_DASH_DATA.dashboard_id = dashCharts['dashboard_id'];
        } else {
          this.HARD_DASH_DATA.dashboard_id = dashCharts[0].dashboard_id;

          dashCharts.forEach(chart => this.addChartToDashboard(chart));
          this.globalEventService.updateChartList.next(true);
        }

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
  }

  addChartToDashboard(chart: DashboardCharts) {
    const chartToPush: DashboardCharts = chart;

    this.chartsCallService.getDataByChartId(chart.chart_id)
      .subscribe(data => {

        chartToPush.chartData = this.chartsCallService.formatDataByChartId(chart.chart_id, data);
        chartToPush.color = chartToPush.chartData.options.colors[0]

        this.chartArray$.push(chartToPush);
      }, error1 => {
        console.log('Error querying the chart');
        console.log(error1);
      });
  }
}
