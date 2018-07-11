import {Component, OnInit} from '@angular/core';
import {first} from 'rxjs/internal/operators';
import {FacebookService} from '../../../shared/_services/facebook.service';

@Component({
  selector: 'app-feature-dashboard-facebook',
  templateUrl: './facebook.component.html'
})

export class FeatureDashboardFacebookComponent implements OnInit {
  // Fans chart
  fanChartData: Array<any> = [];
  fanValues: Number[] = [];
  fanLabels: Array<any> = [];
  fanLock = false;

  // Impressions chart
  impressChartData: Array<any> = [];
  impressValues: Number[] = [];
  impressLabels: Array<any> = [];
  impressLock = false;

  // ChartJS options
  public chartOptions1: any = {
    animation: false,
    responsive: true,
    scales: {xAxes: [{ticks: {display: false}}]},
    elements: {point: {radius: 0}}
  };
  public chartColor1: Array<any> = [
    { // grey
      backgroundColor: '#b3b3ff',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];

  public chartTypeLine = 'line';
  public chartLegendFalse = false;

  // GoogleChart options
  public mapchartData = [
    ['Country', 'Popularity'],
    ['Germany', 200],
    ['United States', 300],
    ['Brazil', 400],
    ['Canada', 500],
    ['France', 600],
    ['RU', 700]
  ];
  public mapchartOptions = {};


  constructor(private facebookService: FacebookService) {
  }

  ngOnInit(): void {
    this.getFanCount();
    this.getPageImpressions();
  }

  getFanCount(): void {

    this.facebookService.fbfancount()
      .pipe(first())
      .subscribe(data => {

          // Push data pairs in the chart array
          for (let i = 0; i < data.length; i++) {

            if (i % 10 === 0) { // Data are greedy sampled by 10 units
              this.fanValues.push(data[i].value);
              this.fanLabels.push(data[i].end_time);
            }
          }
          this.fanChartData = [{data: this.fanValues, label: 'fanCount', fill: true, cubicInterpolationMode: 'default'}];

          this.fanLock = true;
        }, error => {
          if (error) {
            console.log('errore'); // TODO FIXME
          }
        }
      );
  }

  getPageImpressions(): void {

    this.facebookService.fbpageimpressions()
      .pipe(first())
      .subscribe(data => {

          for (let i = 0; i < data.length; i++) {

            if (i % 10 === 0) {
              this.impressValues.push(data[i].value);
              this.impressLabels.push(data[i].end_time);
            }
          }
          this.impressChartData = [{data: this.impressValues, label: 'pageImpressions', fill: true, cubicInterpolationMode: 'default'}];

          this.impressLock = true;
        }, error => {
          if (error) {
            console.log('errore'); // TODO FIXME
          }
        }
      );
  }

}
