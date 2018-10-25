import {NgModule} from '@angular/core';
import {AppFooterModule} from '@coreui/angular';
import {SharedModule} from '../../shared/shared.module';
import {CoreModule} from '../../core/core.module';
import {FeatureDashboardComponent} from './dashboard.component';
import {FeatureDashboardRoutingModule} from './dashboard.routing';
import {FeatureDashboardFacebookModule} from './facebook/facebook.module';
import {FeatureDashboardGoogleAnalyticsModule} from './googleAnalytics/googleAnalytics.module';
import {BsDatepickerModule} from 'ngx-bootstrap';

@NgModule({
  declarations: [
    FeatureDashboardComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    AppFooterModule,
    FeatureDashboardFacebookModule,
    FeatureDashboardGoogleAnalyticsModule,
    FeatureDashboardRoutingModule
  ],
  providers: [

  ],
  exports: [
    FeatureDashboardComponent
  ]
})

export class FeatureDashboardModule { }
