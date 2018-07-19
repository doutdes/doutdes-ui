import {Component, HostBinding, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-card',
  template: `
    <div class="rounded-top" [ngStyle]="{'backgroundColor': background, 'color': color}" style="padding:10px">
      <i class="fab" [ngClass]="icon" style="padding-bottom:3px; padding-left:10px; padding-right:10px"></i>
      <span style="font-size:14pt">{{title}}</span>
    </div>
    <div style="background:#fff; min-height:350px; padding:20px" class="rounded-bottom border">
      <google-chart id="{{chartType}}" style="height:310px" [data]="chartData" #mychart (window:resize)="chartResizer()">
      </google-chart>
    </div>
  `
})

export class CardComponent implements OnInit {
  @Input() title = 'empty';
  @Input() background = '#000';
  @Input() color = '#fff';
  @Input() icon: string;
  @Input() chartData: any;
  @Input() chartType: string;
  @Input() lgOrder: string;
  @Input() mdOrder: string;
  @HostBinding('class') elementClass = 'col-lg-4 col-md-6 pt-3';
  @ViewChild('mychart') mychart;

  ngOnInit() {

    this.elementClass = this.elementClass + ' order-lg-' + this.lgOrder + ' order-md-' + this.mdOrder;

    // Handling icon nicknames
    switch (this.icon) {
      case 'facebook': {
        this.icon = 'fa-facebook-f';
        break;
      }
      default: {
        break;
      }
    }

    // Handling background nicknames
    switch (this.background) {
      case 'lightblue': {
        this.background = '#0B9AC1';
        break;
      }
      case 'green': {
        this.background = '#2C994B';
        break;
      }
      case 'red': {
        this.background = '#E04545';
        break;
      }
      case 'peach': {
        this.background = '#FF703D';
        break;
      }
      default: {
        break;
      }
    }
  }

  chartResizer(): void {
    this.mychart.redraw();
  }
}
