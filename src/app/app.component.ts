import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {environment} from '../environments/environment';

@Component({
  // tslint:disable-next-line
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
  // templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {
  }

  ngOnInit() {

    console.warn(environment.production);

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
}
