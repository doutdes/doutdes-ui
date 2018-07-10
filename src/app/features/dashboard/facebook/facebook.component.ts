import {Component, OnInit} from '@angular/core';
import {first} from 'rxjs/internal/operators';
import {FacebookService} from '../../../shared/_services/facebook.service';
import {FacebookFanCount, FacebookImpressions} from '../../../shared/_models/FacebookData';

@Component({
  selector: 'app-feature-dashboard-facebook',
  templateUrl: './facebook.component.html'
})

export class FeatureDashboardFacebookComponent implements OnInit {
  dati: Array<any> = [];
  dati2 : Array<any> = [];
  values: Number[] = [];
  values2: Number[] = [];
  etichette: Array<any> = [];
  etichette2: Array<any> = [];
  check = false;
  check2 = false;

  public opzioni: any = {
    animation: false,
    responsive: true,
    scales: {xAxes: [{ticks: {display: false}}]},
    elements: {point: {radius: 0}}
  };
  public colori: Array<any> = [
    { // grey
      backgroundColor: '#b3b3ff',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];

  public tipo = 'line';
  public legenda = false;


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
          console.log('sono entrato');

          for (let i = 0; i < data.length; i++) {

            if (i % 10 === 0) {
              this.values.push(data[i].value);
              this.etichette.push(data[i].end_time);
            }
          }
          this.dati = [{data: this.values, label: 'fanCount', fill: true, cubicInterpolationMode: 'default'}];

          console.log(this.dati);
          console.log(this.etichette);

          this.check = true;
        }, error => {
          if (error) {
            console.log('errore');
          }
        }
      );
  }

  getPageImpressions(): void {

    this.facebookService.fbpageimpressions()
      .pipe(first())
      .subscribe(data => {
          console.log('sono entrato');

          for (let i = 0; i < data.length; i++) {

            if (i % 10 === 0) {
              this.values2.push(data[i].value);
              this.etichette2.push(data[i].end_time);
            }
          }
          this.dati2 = [{data: this.values2, label: 'pageImpressions', fill: true, cubicInterpolationMode: 'default'}];

          console.log(this.dati2);
          console.log(this.etichette2);

          this.check2 = true;
        }, error => {
          if (error) {
            console.log('errore');
          }
        }
      );
  }

}
