import {Component, OnDestroy, OnInit} from '@angular/core';
import {Breadcrumb} from '../../core/breadcrumb/Breadcrumb';
import {ApiKeysService} from '../../shared/_services/apikeys.service';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';

@Component({
  selector: 'app-feature-calendar',
  templateUrl: './calendar.component.html',
})
export class FeatureCalendarComponent implements OnInit, OnDestroy{


  constructor(private breadcrumbActions: BreadcrumbActions) {
  }

  ngOnInit(): void {
    this.addBreadcrumb();
  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Calendar', '/calendar/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }
}
