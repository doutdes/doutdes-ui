import {NgModule} from '@angular/core';
import {FeatureDashboardFacebookMarketingComponent} from './facebook-marketing.component';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {FacebookMarketingService} from '../../../shared/_services/facebook-marketing.service';
import {CoreModule} from '../../../core/core.module';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {NgxLoadingModule} from 'ngx-loading';
import {BsDatepickerModule, BsDropdownModule, BsLocaleService} from 'ngx-bootstrap';
import {SharedModule} from '../../../shared/shared.module';
import {ChartsCallsService} from '../../../shared/_services/charts_calls.service';


@NgModule({
  declarations: [
    FeatureDashboardFacebookMarketingComponent
  ],
  imports: [
    CoreModule,
    RouterModule,
    CommonModule,
    NgxLoadingModule.forRoot({}),
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    SharedModule,
  ],
  providers: [
    BreadcrumbActions,
    FacebookMarketingService,
  ],
  exports: [
    FeatureDashboardFacebookMarketingComponent
  ]
})

export class FeatureDashboardFacebookMarketingModule { }
