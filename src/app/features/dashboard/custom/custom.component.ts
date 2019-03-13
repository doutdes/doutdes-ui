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
import {subDays} from 'date-fns';
import {ngxLoadingAnimationTypes} from 'ngx-loading';
import {FacebookService} from '../../../shared/_services/facebook.service';
import {AggregatedDataService} from '../../../shared/_services/aggregated-data.service';
import {InstagramService} from '../../../shared/_services/instagram.service';
import {D_TYPE} from '../../../shared/_models/Dashboard';

const PrimaryWhite = '#ffffff';

@Component({
  selector: 'app-feature-dashboard-custom',
  templateUrl: './custom.component.html'
})

export class FeatureDashboardCustomComponent implements OnInit, OnDestroy {

  public HARD_DASH_DATA = {
    dashboard_type: D_TYPE.CUSTOM,
    dashboard_id: null
  };

  private fbPageID = null;
  private igPageID = null;
  private pageID = null;

  public FILTER_DAYS = {
    seven: 7,
    thirty: 30,
    ninety: 90
  };

  public chartArray$: Array<DashboardCharts> = [];
  private dashStored: Array<DashboardCharts> = [];

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
    private IGService: InstagramService,
    private breadcrumbActions: BreadcrumbActions,
    private DService: DashboardService,
    private CCService: ChartsCallsService,
    private GEService: GlobalEventsManagerService,
    private filterActions: FilterActions,
    private ADService: AggregatedDataService
  ) {

  }

  async loadDashboard() {

    const observables: Observable<any>[] = [];
    const chartsToShow: Array<DashboardCharts> = [];
    const dateInterval: IntervalDate = {
      first: this.minDate,
      last: this.maxDate
    };
    let currentData: DashboardData;
    let pageID = null;

    this.GEService.loadingScreen.next(true);

    // Retrieving dashboard ID
    const dash = await this.DService.getDashboardByType(0).toPromise(); // Custom dashboard type

    // Retrieving the pages ID // TODO to add the choice of the page, now it takes just the first one
    this.fbPageID = (await this.FBService.getPages().toPromise())[0].id;
    this.igPageID = (await this.IGService.getPages().toPromise())[0].id;

    if (dash.id) {
      this.HARD_DASH_DATA.dashboard_id = dash.id; // Retrieving dashboard id
    }
    else {
      console.error('Cannot retrieve a valid ID for the Facebook dashboard.');
      return;
    }

    if (this.dashStored) {
      // Ci sono già dati salvati
      this.filterActions.loadStoredDashboard(D_TYPE.CUSTOM);
    } else {

      this.DService.getAllDashboardCharts(this.HARD_DASH_DATA.dashboard_id)
        .subscribe(charts => {

          if (charts && charts.length > 0) { // Checking if dashboard is not empty

            console.log(charts);

            charts.forEach(chart => {
              this.getPageID(chart.type);
              observables.push(this.CCService.retrieveChartData(chart.chart_id, this.pageID));
            }); // Retrieves data for each chart

            forkJoin(observables)
              .subscribe(dataArray => {
                for (let i = 0; i < dataArray.length; i++) {

                  let chart: DashboardCharts = charts[i];

                  if (!dataArray[i].status && chart) { // If no error is occurred when retrieving chart data
                    chart.chartData = dataArray[i];
                    // chart.color = chart.chartData.options.color ? chart.chartData.options.colors[0] : null;
                    chart.error = false;
                  } else {

                    chart.error = true;

                    console.error('ERROR in CUSTOM-COMPONENT. Cannot retrieve data from one of the charts. More info:');
                    console.error(dataArray[i]);
                  }

                  chartsToShow.push(chart);
                }

                currentData = {
                  data: chartsToShow,
                  interval: dateInterval,
                  type: D_TYPE.CUSTOM,
                };

                this.filterActions.initData(currentData);
                this.GEService.updateChartList.next(true);

                // Shows last 30 days
                this.bsRangeValue = [subDays(new Date(), this.FILTER_DAYS.thirty), this.lastDateRange];

                this.GEService.loadingScreen.next(false);
              });

          } else {
            this.GEService.loadingScreen.next(false);
          }
        }, err => {
          console.error('ERROR in CUSTOM-COMPONENT. Cannot retrieve dashboard charts. More info:');
          console.log(err);
        });
    }
  }

  addChartToDashboard(dashChart: DashboardCharts) {
    const chartToPush: DashboardCharts = dashChart;

    const dateInterval: IntervalDate = {
      first: this.bsRangeValue[0],
      last: this.bsRangeValue[1]
    };

    this.CCService.retrieveChartData(dashChart.chart_id, this.pageID, dateInterval)
      .subscribe(chartData => {

        if (!chartData['status']) { // Se la chiamata non rende errori

          chartToPush.chartData = chartData;
          // chartToPush.color = chartToPush.chartData.chartType === 'Table' ? null : chartToPush.chartData.options.colors[0];
          chartToPush.error = false;

        } else {
          chartToPush.error = true;
          console.log('Errore recuperando dati per ' + dashChart);
        }
        this.filterActions.addChart(chartToPush);
      }, error1 => {
        console.log('Error querying the Chart');
        console.log(error1);
      });
  }

  onValueChange(value): void {
    if (value) {
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
      const index = elements['storedDashboards'] ? elements['storedDashboards'].findIndex((el: DashboardData) => el.type === D_TYPE.CUSTOM) : -1;
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
          //this.GEService.showChartInDashboard.next(null); //reset data
          console.log(this.GEService.getSubscribers());
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
      console.log(this.GEService.getSubscribers());
    }

    this.addBreadcrumb();
    this.loadDashboard();
  }

  ngOnDestroy() {
    this.removeBreadcrumb();
    this.filterActions.removeCurrent();
  }

  nChartEven() {
    return this.chartArray$.length % 2 === 0;
  }

  getPageID(type: number) {
    switch (type) {
      case D_TYPE.FB:
        this.pageID = this.fbPageID;
        break;
      case D_TYPE.IG:
        this.pageID = this.igPageID;
        break;
      default:
        this.pageID = null;
        break;
    }

  }
}
