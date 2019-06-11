import {NgModule} from '@angular/core';
import {AppFooterModule} from '@coreui/angular';
import {SharedModule} from '../../shared/shared.module';
import {CoreModule} from '../../core/core.module';
import {FeatureDashboardComponent} from './dashboard.component';
import {FeatureDashboardRoutingModule} from './dashboard.routing';
import {FeatureDashboardFacebookModule} from './facebook/facebook.module';
import {FeatureDashboardGoogleAnalyticsModule} from './googleAnalytics/googleAnalytics.module';
import {FeatureDashboardYoutubeAnalyticsModule} from './youtube/youtube.module';
import {FeatureDashboardCustomModule} from './custom/custom.module';
import {AggregatedDataService} from '../../shared/_services/aggregated-data.service';
import {FeatureDashboardInstagramModule} from './instagram/instagram.module';

@NgModule({
  declarations: [
    FeatureDashboardComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    AppFooterModule,
    FeatureDashboardFacebookModule,
    FeatureDashboardInstagramModule,
    FeatureDashboardGoogleAnalyticsModule,
    FeatureDashboardYoutubeAnalyticsModule,
    FeatureDashboardCustomModule,
    FeatureDashboardRoutingModule
  ],
  providers: [
    AggregatedDataService
  ],
  exports: [
    FeatureDashboardComponent
  ]
})

export class FeatureDashboardModule { }
