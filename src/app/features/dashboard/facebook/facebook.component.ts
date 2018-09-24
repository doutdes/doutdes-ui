import {Component, OnDestroy, OnInit} from '@angular/core';
import {first} from 'rxjs/internal/operators';
import {FacebookService} from '../../../shared/_services/facebook.service';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {DashboardService} from '../../../shared/_services/dashboard.service';
import {ChartsCallsService} from '../../../shared/_services/charts_calls.service';

@Component({
  selector: 'app-feature-dashboard-facebook',
  templateUrl: './facebook.component.html'
})

export class FeatureDashboardFacebookComponent implements OnInit, OnDestroy {

  // Fans chart
  // fanchartArray$: Array<any> = [];

  // Impressions chart
  public chartArray$: Array<any> = [];

  public fanChartData = null;
  public impressChartData = null;
  public geoChartData = null;
  public pieChartData = null;

  constructor(
    private facebookService: FacebookService,
    private breadcrumbActions: BreadcrumbActions,
    private dashboardService: DashboardService,
    private chartsCallService: ChartsCallsService
  ) {
  }

  ngOnInit(): void {

    // Query per recuperare i grafici di questo determinato servizio per l'utente in uso
    // Disegno successivo dei grafici scelti

    this.loadDashboard();
    this.addBreadcrumb();

    // this.initFanWidget();
    // this.initImpressionWidget();
    // this.initGeomapWidget();
    // this.initPieWidget();

  }

  // initFanWidget(): void {
  //
  //   this.facebookService.fbfancount()
  //     .pipe(first())
  //     .subscribe(data => {
  //
  //         const header = [['Date', 'Number of fans']];
  //
  //         // Push data pairs in the chart array
  //         for (let i = 0; i < data.length; i++) {
  //
  //           if (i % 10 === 0) { // Data are greedy sampled by 10 units
  //             this.fanchartArray$.push([new Date(data[i].end_time), data[i].value]); // [data[i].end_time, data[i].value]);
  //           }
  //         }
  //
  //         this.fanChartData = {
  //           chartType: 'AreaChart',
  //           dataTable: header.concat(this.fanchartArray$),
  //           options: {
  //             chartArea: {left: 30, right: 0, height: 280, top: 0},
  //             legend: {position: 'none'},
  //             height: 310,
  //             explorer: {},
  //             colors: ['#63c2de'],
  //             areaOpacity: 0.4
  //           }
  //         };
  //
  //       }, error => {
  //         if (error) {
  //           console.log('errore'); // TODO FIXME
  //         }
  //       }
  //     );
  // }

  // initImpressionWidget(): void {
  //
  //   this.facebookService.fbpageimpressions()
  //     .pipe(first())
  //     .subscribe(data => {
  //
  //         const header = [['Date', 'Impressions']];
  //         for (let i = 0; i < data.length; i++) {
  //
  //           // if (i % 2 === 0) {
  //           this.impresschartArray$.push([new Date(data[i].end_time), data[i].value]);
  //           // }
  //         }
  //
  //         this.impressChartData = {
  //           chartType: 'AreaChart',
  //           dataTable: header.concat(this.impresschartArray$),
  //           options: {
  //             chartArea: {left: 30, right: 0, height: 280, top: 0},
  //             legend: {position: 'none'},
  //             height: 310,
  //             explorer: {},
  //             colors: ['#8CCEA0'],
  //             areaOpacity: 0.4
  //           }
  //         };
  //       }, error => {
  //         if (error) {
  //           console.log('errore'); // TODO FIXME
  //         }
  //       }
  //     );
  // }

  // initGeomapWidget(): void {
  //
  //   this.facebookService.fbfancountry()
  //     .pipe(first())
  //     .subscribe(data => {
  //         const header = [['Country', 'Popularity']];
  //         const arr = Object.keys(data[0].value).map(function (k) {
  //           return [k, data[0].value[k]];
  //         });
  //
  //         this.geoChartData = {
  //           chartType: 'GeoChart',
  //           dataTable: header.concat(arr)
  //           ,
  //           options: {
  //             region: 'world',
  //             colorAxis: {colors: ['#F7DEDE', '#EF7C7C']},
  //             backgroundColor: '#fff',
  //             datalessRegionColor: '#eee',
  //             defaultColor: '#333',
  //             height: '300'
  //           }
  //         };
  //       }, error => {
  //         if (error) {
  //           console.log('errore'); // TODO FIXME
  //         }
  //       }
  //     );
  // }

  // initPieWidget(): void {
  //
  //   this.facebookService.fbfancountry()
  //     .pipe()
  //     .subscribe(
  //       data => {
  //         const header = [['Country', 'Popularity']];
  //         const arr = Object.keys(data[0].value).map(function (k) {
  //           return [k, data[0].value[k]];
  //         });
  //
  //         this.pieChartData = {
  //           chartType: 'PieChart',
  //           dataTable: header.concat(arr),
  //           options: {
  //             fontSize: 12,
  //             legend: {position: 'labeled', textStyle: {fontSize: 14}},
  //             chartArea: {height: 220, left: 0, right: 0},
  //             height: 250,
  //             sliceVisibilityThreshold: 0.05,
  //             pieHole: 0.15,
  //             is3D: false,
  //             colors: ['#e0440e', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6']
  //           }
  //         };
  //       },
  //       error => {
  //         if (error) {
  //           console.log('errore'); // TODO FIXME
  //         }
  //       }
  //     );
  // }

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

  // Get charts by dashboard type and user
  loadDashboard() {
    this.dashboardService.getDashboardByType(1)
      .subscribe(dashCharts => {

        console.log('Qua ottengo la dashboard');
        console.log(dashCharts);

        dashCharts.forEach(chart => {
          const chartToPush = chart;

          console.log('Chart da ottenere: ' + chart.title);

          this.chartsCallService.getDataByChartId(chart.chart_id)
            .subscribe(data => {

              const header = [['Date', 'Number of fans']];
              let chartDataArray: Array<any> = [];

              // Push data pairs in the chart array
              for (let i = 0; i < data.length; i++) {

                if (i % 10 === 0) { // Data are greedy sampled by 10 units
                  chartDataArray.push([new Date(data[i].end_time), data[i].value]); // [data[i].end_time, data[i].value]);
                }
              }

              // chartToPush.chartdata = {
              //     chartType: 'AreaChart',
              //     dataTable: header.concat(chartDataArray),
              //     options: {
              //       chartArea: {left: 30, right: 0, height: 280, top: 0},
              //       legend: {position: 'none'},
              //       height: 310,
              //       explorer: {},
              //       colors: ['#63c2de'],
              //       areaOpacity: 0.4
              //     }
              //   };

              chartToPush.chartdata = this.chartsCallService.formatDataByChartId(chart.chart_id, data);

              console.log(chartToPush);

              this.chartArray$.push(chartToPush);
            }, error1 => {
              console.log('Error querying the chart');
              console.log(error1);
            });

          console.log(this.chartArray$);
        });

      }, error1 => {
        console.log('Error querying the charts of the Facebook Dashboard');
        console.log(error1);
      });
  }

  // initWidget(title): Promise<any> {
  //   this.chartsCallService.getDataByChartTitle(title)
  //     .pipe(first())
  //     .subscribe(data => {
  //
  //       console.log('porca miseria');
  //
  //       const header = [['Date', 'Number of fans']];
  //       let chartArray$: Array<any> = [];
  //
  //       // Push data pairs in the chart array
  //       for (let i = 0; i < data.length; i++) {
  //
  //         if (i % 10 === 0) { // Data are greedy sampled by 10 units
  //           chartArray$.push([new Date(data[i].end_time), data[i].value]); // [data[i].end_time, data[i].value]);
  //         }
  //       }
  //
  //       return new Promise((resolve) => {
  //         resolve({
  //           chartType: 'AreaChart',
  //           dataTable: header.concat(chartArray$),
  //           options: {
  //             chartArea: {left: 30, right: 0, height: 280, top: 0},
  //             legend: {position: 'none'},
  //             height: 310,
  //             explorer: {},
  //             colors: ['#63c2de'],
  //             areaOpacity: 0.4
  //           }
  //         });
  //       });
  //
  //     }, error1 => {
  //       console.log('Error querying the chart');
  //       console.log(error1);
  //     });
  //
  //   return null;
  // }
}
