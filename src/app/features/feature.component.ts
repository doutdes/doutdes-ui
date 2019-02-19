import {Component, OnInit} from '@angular/core';
import {ngxLoadingAnimationTypes} from 'ngx-loading';
import {GlobalEventsManagerService} from '../shared/_services/global-event-manager.service';

@Component({
  selector: 'app-feature',
  templateUrl: './feature.component.html',
})
export class FeatureComponent implements OnInit {
  public config = {
    animationType: ngxLoadingAnimationTypes.threeBounce,
    backdropBackgroundColour: 'rgba(0,0,0,0.1)',
    backdropBorderRadius: '4px',
    primaryColour: '#FFF',
    secondaryColour: '#FFF'
  };

  loading: boolean = true;

  constructor(private GEservice: GlobalEventsManagerService) {}

  ngOnInit(): void {
    this.GEservice.loadingScreen.subscribe(value => this.loading = value);
  }

}
