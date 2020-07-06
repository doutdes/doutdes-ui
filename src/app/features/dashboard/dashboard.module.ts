import {NgModule} from '@angular/core';
import {AppFooterModule} from '@coreui/angular';
import {SharedModule} from '../../shared/shared.module';
import {CoreModule} from '../../core/core.module';
import {FeatureDashboardComponent} from './dashboard.component';
import {FeatureDashboardRoutingModule} from './dashboard.routing';
import {FeatureDashboardGoogleAnalyticsModule} from './googleAnalytics/googleAnalytics.module';
import {FeatureDashboardYoutubeAnalyticsModule} from './youtube/youtube.module';
import {FeatureDashboardCustomModule} from './custom/custom.module';
import {AggregatedDataService} from '../../shared/_services/aggregated-data.service';
import {FeatureDashboardInstagramModule} from './instagram/instagram.module';
import {FeatureDashboardFacebookModule} from './facebook/facebook.module';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {UserService} from '../../shared/_services/user.service';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient} from '@angular/common/http';
import {PopoverModule} from 'ngx-bootstrap';


@NgModule({
  declarations: [
    FeatureDashboardComponent,
  ],
  imports: [
    CoreModule,
    SharedModule,
    AppFooterModule,
    FeatureDashboardCustomModule,
    FeatureDashboardFacebookModule,
    FeatureDashboardInstagramModule,
    FeatureDashboardGoogleAnalyticsModule,
    FeatureDashboardYoutubeAnalyticsModule,
    FeatureDashboardRoutingModule,
    PopoverModule.forRoot(),
    PopoverModule.forRoot(),
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
