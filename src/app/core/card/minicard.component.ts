import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {MiniCard} from '../../shared/_models/MiniCard';

@Component({
  selector: 'app-minicard',
  templateUrl: './minicard.component.html',
})

export class MiniCardComponent implements OnInit {

  // Dimensions of the card
  @HostBinding('class') elementClass = 'col-md-3 col-sm-3 col-6';

  // Input of the card
  @Input() padding: string;
  @Input() minicard: MiniCard;


  ngOnInit(): void {
    this.elementClass += ' ' + this.padding;

  }

}
