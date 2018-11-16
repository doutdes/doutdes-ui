import {NgModule} from '@angular/core';
import {AppFooterModule} from '@coreui/angular';
import {SharedModule} from '../../shared/shared.module';
import {CoreModule} from '../../core/core.module';
import {FeatureDashboardComponent} from './dashboard.component';
import {FeatureDashboardRoutingModule} from './dashboard.routing';
import {FeatureDashboardFacebookModule} from './facebook/facebook.module';
import {FeatureDashboardGoogleAnalyticsModule} from './googleAnalytics/googleAnalytics.module';
import {BsDatepickerModule} from 'ngx-bootstrap';
import {FeatureDashboardCustomModule} from './custom/custom.module';

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
    FeatureDashboardCustomModule,
    FeatureDashboardRoutingModule
  ],
  providers: [

  ],
  exports: [
    FeatureDashboardComponent
  ]
})

export class FeatureDashboardModule { }
