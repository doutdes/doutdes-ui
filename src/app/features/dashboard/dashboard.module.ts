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
import {FeatureDashboardFacebookMarketingModule} from './facebook-marketing/facebook-marketing.module';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {UserService} from '../../shared/_services/user.service';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient} from '@angular/common/http';


@NgModule({
  declarations: [
    FeatureDashboardComponent
  ],
  imports: [
    CoreModule,
    SharedModule,
    AppFooterModule,
    FeatureDashboardCustomModule,
    FeatureDashboardRoutingModule,
    FeatureDashboardFacebookModule,
    FeatureDashboardInstagramModule,
    FeatureDashboardGoogleAnalyticsModule,
    FeatureDashboardYoutubeAnalyticsModule,
    FeatureDashboardFacebookMarketingModule,
    FeatureDashboardCustomModule,
    FeatureDashboardRoutingModule,
  ],
  providers: [
    UserService,
    AggregatedDataService
  ],
  exports: [
    FeatureDashboardComponent
  ]
})

export class FeatureDashboardModule { }
