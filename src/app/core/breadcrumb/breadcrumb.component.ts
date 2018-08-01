import {Component, OnInit} from '@angular/core';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {NgRedux, select} from '@angular-redux/store';
import {Observable} from 'rxjs';
import {Breadcrumb} from './Breadcrumb';
import {IAppState} from '../../shared/store/model';

@Component({
  selector: 'app-core-breadcrumb',
  templateUrl: './breadcrumb.component.html',
})

export class BreadcrumbComponent implements OnInit {

  @select() breadcrumb$: Observable<Breadcrumb[]>;
  breadList = [];
  isUserLoggedIn: boolean;

  constructor(private globalEventService: GlobalEventsManagerService, private ngRedux: NgRedux<IAppState>) {
    this.globalEventService.isUserLoggedIn.subscribe(value => {
      this.isUserLoggedIn = value;
    });

    this.breadcrumb$.subscribe(elements => {
      this.breadList = elements['list'];
    });
  }

  ngOnInit(): void {
  }

}
