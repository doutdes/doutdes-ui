import {Component, OnInit} from '@angular/core';
import {ngxLoadingAnimationTypes} from 'ngx-loading';
import {GlobalEventsManagerService} from '../shared/_services/global-event-manager.service';
import {ElementRef} from '@angular/core';
import {Renderer2} from '@angular/core';

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
  drag: boolean;

  constructor(private GEservice: GlobalEventsManagerService, private host: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.GEservice.loadingScreen.subscribe(value => this.loading = value);
    this.GEservice.dragAndDrop.subscribe(value => this.drag = value);

    if (this.drag) {
      this.renderer.setStyle(this.host.nativeElement, 'background-color', 'rgb(210, 209, 209)');
    }

  }

}
