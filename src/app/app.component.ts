import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {GlobalEventsManagerService} from './shared/_services/global-event-manager.service';

@Component({
  // tslint:disable-next-line
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
  // templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  drag: boolean;

  constructor (
    private router: Router,
    private GEservice: GlobalEventsManagerService ) {}

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });

    this.GEservice.dragAndDrop.subscribe(value => this.drag = value);

  }

}
