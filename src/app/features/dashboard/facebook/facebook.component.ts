import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {first} from 'rxjs/internal/operators';
import {FacebookService} from '../../../shared/_services/facebook.service';

@Component({
  selector: 'app-feature-dashboard-facebook',
  templateUrl: './facebook.component.html'
})

export class FeatureDashboardFacebookComponent implements OnInit {
  @ViewChild('geochart') geochart;
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
      backgroundColor: '#63c2de',
      borderColor: '#63c2de',
      pointBackgroundColor: '#fff',
      pointBorderColor: '#fff',
    }
  ];

  public chartColor2: Array<any> = [
  { // grey
    backgroundColor: '#8CCEA0',
    borderColor: '#8CCEA0',
    pointBackgroundColor: '#fff',
    pointBorderColor: '#fff',
  }
];

  public chartTypeLine = 'line';
  public chartLegendFalse = false;

  // GoogleChart options
  public geoChartData = {
    chartType: 'GeoChart',
    dataTable: [
      ['Country', 'Popularity'],
      ['Germany', 200],
      ['United States', 300],
      ['Brazil', 400],
      ['Canada', 500],
      ['France', 600],
      ['RU', 700]
    ],
    options: {
      region: 'world',
      colorAxis: {colors: ['#F7DEDE', '#EF7C7C']},
      backgroundColor: '#fff',
      datalessRegionColor: '#eee',
      defaultColor: '#333',
      width: '80%'
    }
  };


  constructor(private facebookService: FacebookService) {
  }

  myfunction(): void {
    this.geochart.redraw();
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
          this.fanChartData = [{data: this.fanValues, borderWidth: 1, fill: true, cubicInterpolationMode: 'default'}];

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

            if (i % 20 === 0) {
              this.impressValues.push(data[i].value);
              this.impressLabels.push(data[i].end_time);
            }
          }
          this.impressChartData = [{data: this.impressValues, borderWidth: 1, fill: true, cubicInterpolationMode: 'default'}];

          this.impressLock = true;
        }, error => {
          if (error) {
            console.log('errore'); // TODO FIXME
          }
        }
      );
  }

}
