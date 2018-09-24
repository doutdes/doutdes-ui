import {Component, OnDestroy, OnInit} from '@angular/core';
import {FacebookService} from '../../../shared/_services/facebook.service';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {DashboardService} from '../../../shared/_services/dashboard.service';
import {ChartsCallsService} from '../../../shared/_services/charts_calls.service';
import {GlobalEventsManagerService} from '../../../shared/_services/global-event-manager.service';

@Component({
  selector: 'app-feature-dashboard-facebook',
  templateUrl: './facebook.component.html'
})

export class FeatureDashboardFacebookComponent implements OnInit, OnDestroy {

  public HARD_DASH_DATA = {
    dashboard_type: 1,
    dashboard_id: null
  };


  public chartArray$: Array<any> = [];

  constructor(
    private facebookService: FacebookService,
    private breadcrumbActions: BreadcrumbActions,
    private dashboardService: DashboardService,
    private chartsCallService: ChartsCallsService,
    private globalEventService: GlobalEventsManagerService
  ) {
    this.globalEventService.refreshDashboard.subscribe(value => {
      if(value){
        this.chartArray$ = [];
        this.loadDashboard();
        this.globalEventService.isUserLoggedIn.next(false);
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
        let i = 0;

        this.HARD_DASH_DATA.dashboard_id = dashCharts[0].dashboard_id;

        dashCharts.forEach(chart => {
          const chartToPush = chart;

          this.chartsCallService.getDataByChartId(chart.chart_id)
            .subscribe(data => {

              chartToPush.chartData = this.chartsCallService.formatDataByChartId(chart.chart_id, data);
              chartToPush.position = ++i;
              this.chartArray$.push(chartToPush);
            }, error1 => {
              console.log('Error querying the chart');
              console.log(error1);
            });
        });

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
}
