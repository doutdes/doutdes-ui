import {NgModule} from '@angular/core';
import {AppFooterModule} from '@coreui/angular';
import {SharedModule} from '../../../shared/shared.module';
import {CoreModule} from '../../../core/core.module';
import {FeatureDashboardFacebookInsightComponent} from './insights/facebook-insights.component';
import {RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {FacebookService} from '../../../shared/_services/facebook.service';
import {ChartsModule} from 'ng2-charts/ng2-charts';
import {Ng2GoogleChartsModule} from 'ng2-google-charts';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {DashboardService} from '../../../shared/_services/dashboard.service';
import {ChartsCallsService} from '../../../shared/_services/charts_calls.service';
import {GlobalEventsManagerService} from '../../../shared/_services/global-event-manager.service';
import {BsDatepickerModule, BsDropdownModule, BsLocaleService} from 'ngx-bootstrap';
import {FilterActions} from '../redux-filter/filter.actions';
import {ApiKeysService} from '../../../shared/_services/apikeys.service';
import {UserService} from '../../../shared/_services/user.service';
import {NgxLoadingModule} from 'ngx-loading';

import {defineLocale} from 'ngx-bootstrap';
import {itLocale} from 'ngx-bootstrap/locale';
import {FacebookMarketingService} from '../../../shared/_services/facebook-marketing.service';
import {FeatureDashboardFacebookMarketingComponent} from './marketing/facebook-marketing.component';
import {FeatureDashboardFacebookCampaignsComponent} from './campaigns/facebook-campaigns.component';
import {MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSortModule, MatTableModule} from '@angular/material';

defineLocale('it', itLocale);

@NgModule({
  declarations: [
    FeatureDashboardFacebookInsightComponent,
    FeatureDashboardFacebookCampaignsComponent,
    FeatureDashboardFacebookMarketingComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    ChartsModule,
    Ng2GoogleChartsModule,
    AppFooterModule,
    RouterModule,
    HttpClientModule,
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgxLoadingModule.forRoot({}),
    MatTableModule,
    MatFormFieldModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
  ],
  providers: [
    ApiKeysService,
    FacebookService,
    DashboardService,
    ChartsCallsService,
    BreadcrumbActions,
    FilterActions,
    UserService,
    GlobalEventsManagerService,
    BsLocaleService,
    FacebookMarketingService
  ],
  exports: [
    FeatureDashboardFacebookInsightComponent,
    FeatureDashboardFacebookCampaignsComponent,
    FeatureDashboardFacebookMarketingComponent
  ]
})

export class FeatureDashboardFacebookModule { }
