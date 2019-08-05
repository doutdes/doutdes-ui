import {NgModule} from '@angular/core';
import {FeatureDashboardFacebookMarketingComponent} from './facebook-marketing.component';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {FacebookMarketingService} from '../../../shared/_services/facebook-marketing.service';

@NgModule({
  declarations: [
    FeatureDashboardFacebookMarketingComponent
  ],
  imports: [
  ],
  providers: [
    BreadcrumbActions,
    FacebookMarketingService
  ],
  exports: [
    FeatureDashboardFacebookMarketingComponent
  ]
})

export class FeatureDashboardFacebookMarketingModule { }
