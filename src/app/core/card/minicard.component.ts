import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {MiniCard} from '../../shared/_models/MiniCard';

@Component({
  selector: 'app-minicard',
  templateUrl: './minicard.component.html',
})

export class MiniCardComponent implements OnInit {

  // Dimensions of the card
  @HostBinding('class') elementClass = 'col-md-3 col-sm-3 col-6 ';

  // Input of the card
  @Input() minicard: MiniCard;
  month: string;

  ngOnInit(): void {
    this.elementClass += this.minicard.padding;
    this.month = new Date(0, new Date().getMonth(), 0).toLocaleString('en-us', { month: 'long' });
  }

}
