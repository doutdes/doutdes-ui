import {Component, OnDestroy, OnInit} from '@angular/core';
import {InstagramService} from '../../../shared/_services/instagram.service';
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
import {ngxLoadingAnimationTypes} from 'ngx-loading';
import {ApiKeysService} from '../../../shared/_services/apikeys.service';
import {D_TYPE} from '../../../shared/_models/Dashboard';
import {GaMiniCards, IgMiniCards, MiniCard} from '../../../shared/_models/MiniCard';

const PrimaryWhite = '#ffffff';

@Component({
  selector: 'app-feature-dashboard-instagram',
  templateUrl: './instagram.component.html'
})

export class FeatureDashboardInstagramComponent implements OnInit, OnDestroy {

  public D_TYPE = D_TYPE;

  public HARD_DASH_DATA = {
    dashboard_type: D_TYPE.IG,
    dashboard_id: null
  };

  private pageID = null;

  public FILTER_DAYS = {
    seven: 7,
    thirty: 30,
    ninety: 90
  };

  public chartArray$: Array<DashboardCharts> = [];
  public miniCards: MiniCard[] = IgMiniCards;
  private dashStored: Array<DashboardCharts> = [];

  public loading = false;
  public isApiKeySet = true;
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
  datePickerEnabled = false; // Used to avoid calling onValueChange() on component init

  constructor(
    private IGService: InstagramService,
    private apiKeyService: ApiKeysService,
    private breadcrumbActions: BreadcrumbActions,
    private DService: DashboardService,
    private CCService: ChartsCallsService,
    private GEService: GlobalEventsManagerService,
    private filterActions: FilterActions
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
    const observables = this.CCService.retrieveMiniChartData(D_TYPE.IG, pageID);

    forkJoin(observables).subscribe(miniDatas => {
      for(const i in miniDatas) {
        results = this.CCService.formatMiniChartData(miniDatas[i], D_TYPE.IG, this.miniCards[i].measure, intervalDate);
        this.miniCards[i].value = results['value'];
        this.miniCards[i].progress = results['perc'] + '%';
        this.miniCards[i].step = results['step'];
      }
    });
  }

  async loadDashboard() {
    const existence = await this.checkExistance();
    const observables: Observable<any>[] = [];
    const chartsToShow: Array<DashboardCharts> = [];
    const dateInterval: IntervalDate = {
      first: this.minDate,
      last: this.maxDate
    };
    let currentData: DashboardData;

    if (!existence) { // If the Api Key has not been set yet, then a message is print
      this.isApiKeySet = false;
      return;
    }

    this.GEService.loadingScreen.next(true);

    // Retrieving dashboard ID
    const dash = await this.DService.getDashboardByType(3).toPromise(); // Instagram type

    // Retrieving the page ID // TODO to add the choice of the page, now it takes just the first one
    this.pageID = (await this.IGService.getPages().toPromise())[0].id;

    await this.loadMiniCards(this.pageID);

    if (dash.id) {
      this.HARD_DASH_DATA.dashboard_id = dash.id; // Retrieving dashboard id
    } else {
      console.error('Cannot retrieve a valid ID for the Instagram dashboard.');
      return;
    }

    if (this.dashStored) {
      // Ci sono già dati salvati
      this.filterActions.loadStoredDashboard(D_TYPE.IG);
      this.datePickerEnabled = true;
    } else {
      // Retrieving dashboard charts
      this.DService.getAllDashboardCharts(this.HARD_DASH_DATA.dashboard_id).subscribe(charts => {

        if (charts && charts.length > 0) { // Checking if dashboard is not empty
          // Retrieves data for each chart
          charts.forEach(chart => observables.push(this.CCService.retrieveChartData(chart.chart_id, this.pageID)));

          forkJoin(observables)
            .subscribe(dataArray => {
              for (let i = 0; i < dataArray.length; i++) {

                const chart: DashboardCharts = charts[i];

                if (!dataArray[i].status && chart) { // If no error is occurred when retrieving chart data

                  chart.chartData = dataArray[i];
                  // chart.color = chart.chartData.options.color ? chart.chartData.options.colors[0] : null;
                  chart.error = false;
                } else {
                  chart.error = true;

                  console.error('ERROR in INSTAGRAM COMPONENT. Cannot retrieve data from one of the charts. More info:');
                  console.error(dataArray[i]);
                }

                chartsToShow.push(chart); // Original Data
              }

              currentData = {
                data: chartsToShow,
                interval: dateInterval,
                type: D_TYPE.IG,
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
        console.error('ERROR in INSTAGRAM COMPONENT, when fetching charts.');
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
        first: value[0],
        last: value[1].setHours(23, 59, 59, 999)
      };

      this.filterActions.filterData(dateInterval);
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
    bread.push(new Breadcrumb('Instagram', '/dashboard/instagram/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  async checkExistance() {
    let response;

    try {
      response = await this.apiKeyService.checkIfKeyExists(0).toPromise();
    } catch (e) {
      console.error(e);
      response = null;
    }

    return response;
  }

  ngOnInit(): void {
    this.firstDateRange = this.minDate;
    this.lastDateRange = this.maxDate;
    this.bsRangeValue = [this.firstDateRange, this.lastDateRange];

    this.filter.subscribe(elements => {
      this.chartArray$ = elements['filteredDashboard'] ? elements['filteredDashboard']['data'] : [];
      const index = elements['storedDashboards'] ? elements['storedDashboards'].findIndex((el: DashboardData) => el.type === D_TYPE.IG) : -1;
      this.dashStored = index >= 0 ? elements['storedDashboards'][index] : null;
    });

    const dash_type = this.HARD_DASH_DATA.dashboard_type;

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

    this.loadDashboard();
    this.addBreadcrumb();
  }

  ngOnDestroy() {
    this.removeBreadcrumb();
    this.filterActions.removeCurrent();
  }

  nChartEven() {
    return this.chartArray$.length % 2 === 0;
  }
}
