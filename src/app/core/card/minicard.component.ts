import {ChangeDetectionStrategy, Component, HostBinding, Input, OnInit} from '@angular/core';
import {MiniCard} from '../../shared/_models/MiniCard';
import {D_TYPE} from '../../shared/_models/Dashboard';

@Component({
  selector: 'app-minicard',
  templateUrl: './minicard.component.html'
})

export class MiniCardComponent implements OnInit {

  // Dimensions of the card
  @HostBinding('class') elementClass = 'col-md-3 col-sm-3 col-6 ';

  // Input of the card
  @Input() minicard: MiniCard;
  @Input() dtype: number;

  month: string;
  progressClassColor: string;

  ngOnInit(): void {
    this.elementClass += this.minicard.padding;
    this.month = new Date(0, new Date().getMonth() + 1, 0)
      .toLocaleString('it-it', { month: 'long' }); // This month

    switch (this.dtype) {
      case D_TYPE.FB:
        this.progressClassColor = 'bg-fb-color';
        break;
      case D_TYPE.GA:
        this.progressClassColor = 'bg-ga-color';
        break;
      case D_TYPE.IG:
        this.progressClassColor = 'bg-ig-color';
        break;
      case D_TYPE.YT:
        this.progressClassColor = 'bg-yt-color';
        break;
      default:
        this.progressClassColor = 'bg-danger';
        break;
    } // Set the background of the progress bar
  }



  formatMeasure(measure: string){
    // let result = 0;
    // return result;
    return measure === 'bounce-rate' ? '%' : '';
  }

}
