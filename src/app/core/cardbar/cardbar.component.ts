import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cardbar',
  template: `
    <div class="rounded-top" [ngStyle]="{'backgroundColor': background, 'color': color}" style="padding:10px">
      <i class="fab" [ngClass]="icon" style="padding-bottom:3px; padding-left:10px; padding-right:10px"></i>
      <span style="font-size:14pt">{{title}}</span>
    </div>
  `
})

export class CardbarComponent {
  @Input() title = 'empty';
  @Input() background = '#000';
  @Input() color = '#fff';
  @Input() icon: string;
}
