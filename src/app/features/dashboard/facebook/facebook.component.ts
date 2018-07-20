import {Component, OnInit, ViewChild} from '@angular/core';
import {first} from 'rxjs/internal/operators';
import {FacebookService} from '../../../shared/_services/facebook.service';

@Component({
  selector: 'app-feature-dashboard-facebook',
  templateUrl: './facebook.component.html'
})

export class FeatureDashboardFacebookComponent implements OnInit {

  // Fans chart
  fanChartArray: Array<any> = [];

  // Impressions chart
  impressChartArray: Array<any> = [];

  public fanChartData = null;
  public impressChartData = null;
  public geoChartData = null;
  public pieChartData = null;

  constructor(private facebookService: FacebookService) {
  }

  ngOnInit(): void {
    this.initFanWidget();
    this.initImpressionWidget();
    this.initGeomapWidget();
    this.initPieWidget();
  }

  initFanWidget(): void {

    this.facebookService.fbfancount()
      .pipe(first())
      .subscribe(data => {

          const header = [['Date', 'Fans number']];

          // Push data pairs in the chart array
          for (let i = 0; i < data.length; i++) {

            if (i % 10 === 0) { // Data are greedy sampled by 10 units
              this.fanChartArray.push([data[i].end_time.getMonth, data[i].value]);
            }
          }

          this.fanChartData = {
            chartType: 'AreaChart',
            dataTable: header.concat(this.fanChartArray),
            options: {
              chartArea: {height: '90%', left: 10, right: 10},
              legend: {position: 'none'},
              colors: ['#63c2de'],
              areaOpacity: 0.6
            }
          };

        }, error => {
          if (error) {
            console.log('errore'); // TODO FIXME
          }
        }
      );
  }

  initImpressionWidget(): void {

    this.facebookService.fbpageimpressions()
      .pipe(first())
      .subscribe(data => {

          const header = [['Date', 'Impressions']];
          for (let i = 0; i < data.length; i++) {

            if (i % 20 === 0) {
              this.impressChartArray.push([data[i].end_time.getMonth, data[i].value]);
            }
          }

          this.impressChartData = {
            chartType: 'AreaChart',
            dataTable: header.concat(this.impressChartArray),
            options: {
              chartArea: {height: '90%', left: 10, right: 10},
              legend: {position: 'none'},
              colors: ['#8CCEA0'],
              areaOpacity: 0.6
            }
          };
        }, error => {
          if (error) {
            console.log('errore'); // TODO FIXME
          }
        }
      );
  }

  initGeomapWidget(): void {

    this.facebookService.fbfancountry()
      .pipe(first())
      .subscribe(data => {
          const header = [['Country', 'Popularity']];
          const arr = Object.keys(data[0].value).map(function (k) {
            return [k, data[0].value[k]];
          });

          this.geoChartData = {
            chartType: 'GeoChart',
            dataTable: header.concat(arr)
            ,
            options: {
              region: 'world',
              colorAxis: {colors: ['#F7DEDE', '#EF7C7C']},
              backgroundColor: '#fff',
              datalessRegionColor: '#eee',
              defaultColor: '#333',
              height: '300'
            }
          };
        }, error => {
          if (error) {
            console.log('errore'); // TODO FIXME
          }
        }
      );
  }

  initPieWidget(): void {

    this.facebookService.fbfancountry()
      .pipe()
      .subscribe(
        data => {
          const header = [['Country', 'Popularity']];
          const arr = Object.keys(data[0].value).map(function (k) {
            return [k, data[0].value[k]];
          });

          this.pieChartData = {
            chartType: 'PieChart',
            dataTable: header.concat(arr),
            options: {
              fontSize: 12,
              legend: {position: 'labeled', textStyle: {fontSize: 14}},
              chartArea: {height: 220, left: 0, right: 0},
              height: 250,
              sliceVisibilityThreshold: 0.05,
              pieHole: 0.15,
              is3D: false,
              colors: ['#e0440e', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6']
            }
          };
        },
        error => {
          if (error) {
            console.log('errore'); // TODO FIXME
          }
        }
      );
  }

}
