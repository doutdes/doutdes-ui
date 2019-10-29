import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {MiniCard} from '../../shared/_models/MiniCard';
import {D_TYPE} from '../../shared/_models/Dashboard';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../shared/_services/user.service';
import {User} from '../../shared/_models/User';

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

  lang: string;
  value: string;
  tmp: string;
  user: User;

  constructor(
    public translate: TranslateService,
    private userService: UserService
  ) {
  }

  ngOnInit(): void {
    this.elementClass += this.minicard.padding;
    this.month = new Date(0, new Date().getMonth() + 1, 0)
      .toLocaleString('it-it', {month: 'long'}); // This month

    this.userService.get().subscribe(data => {
      this.user = data;

      this.month = new Date(0, new Date().getMonth(), 0).toLocaleString(this.getLocaleString(), {month: 'long'}); // Previous month

    }, err => {
      console.error(err);
    });

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

  formatMeasure(measure: string) {
    // let result = 0;
    // return result;
    return measure === 'bounce-rate' ? '%' : '';
  }

  getLocaleString() {

    switch (this.user.lang) {
      case 'it':
        this.value = 'it-it';
        break;
      case 'en':
        this.value = 'en-GB';
        break;
      default:
        console.warn('ERRORE NEL MESE DELLE MINICARD');
        this.value = 'it-it';
    }

    return this.value;

  }

}
