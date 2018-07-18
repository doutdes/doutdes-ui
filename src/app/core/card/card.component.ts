import {Component, Host, HostBinding, Input, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-card',
  template: `
      <div class="rounded-top" [ngStyle]="{'backgroundColor': background, 'color': color}" style="padding:10px">
        <i class="fab" [ngClass]="icon" style="padding-bottom:3px; padding-left:10px; padding-right:10px"></i>
        <span style="font-size:14pt">{{title}}</span>
      </div>
      <ng-content></ng-content>
  `
})

export class CardComponent {
  @Input() title = 'empty';
  @Input() background = '#000';
  @Input() color = '#fff';
  @Input() icon: string;
  @HostBinding('class') elementClass = 'col-md-4 col-sm-6 order-md-5 order-sm-4 pt-3'; // TODO add order attribute
}
