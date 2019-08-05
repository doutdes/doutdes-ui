import {Component, OnDestroy, OnInit} from '@angular/core';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {FacebookMarketingService} from '../../../shared/_services/facebook-marketing.service';

@Component({
  selector: 'app-feature-dashboard-facebook-marketing',
  templateUrl: './facebook-marketing.component.html'
})

export class FeatureDashboardFacebookMarketingComponent implements OnInit, OnDestroy {
  title = 'Facebook Marketing';

  constructor(
    private breadcrumbActions: BreadcrumbActions,
    private fbMarketingService: FacebookMarketingService
  ) {
  }

  ngOnInit(): void {
    this.addBreadcrumb();
  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }

  addBreadcrumb = (): void => {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Dashboard', '/dashboard/'));
    bread.push(new Breadcrumb('Facebook Marketing', '/dashboard/facebook-marketing/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  };

  removeBreadcrumb = (): void => {
    this.breadcrumbActions.deleteBreadcrumb();
  };


}
