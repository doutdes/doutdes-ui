import {Component, OnDestroy, OnInit} from '@angular/core';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../core/breadcrumb/Breadcrumb';

@Component({
  selector: 'app-feature-messages',
  templateUrl: './message.component.html',
})

export class FeatureMessageComponent implements OnInit, OnDestroy {
  constructor(
    private breadcrumbActions: BreadcrumbActions
  ) {
  }

  ngOnInit(): void {
    this.addBreadcrumb();
  }

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Messaggi', '/messages/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }


}
