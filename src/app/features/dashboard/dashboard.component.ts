import {Component, OnDestroy, OnInit} from '@angular/core';
import {Breadcrumb} from '../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';

@Component({
  selector: 'app-feature-dashboard',
  templateUrl: './dashboard.component.html'
})
export class FeatureDashboardComponent implements OnInit, OnDestroy{

  constructor(private breadcrumbActions: BreadcrumbActions){
  }

  ngOnInit(){
    this.addBreadcrumb();
  }

  ngOnDestroy(){
    this.removeBreadcrumb();
  }

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Dashboard', '/dashboard/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

}
