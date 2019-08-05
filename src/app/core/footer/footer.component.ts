import {Component} from '@angular/core';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';

@Component({
  selector: 'app-core-footer',
  templateUrl: './footer.component.html',
})

export class FooterComponent {
  copyrightYear = new Date().getFullYear();
  drag: boolean;

  constructor (
    private GEservice: GlobalEventsManagerService
    ) { };

  ngOnInit(): void {
    this.GEservice.dragAndDrop.subscribe(value => this.drag = value);
  }
}
