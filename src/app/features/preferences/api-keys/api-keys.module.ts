import {NgModule} from '@angular/core';
import {SharedModule} from '../../../shared/shared.module';
import {CoreModule} from '../../../core/core.module';
import {FeaturePreferencesApiKeysComponent} from './api-keys.component';
import {ApiKeysService} from '../../../shared/_services/apikeys.service';
import {FeaturePreferencesApiKeysRegisterFormComponent} from './register-form/register-form.component';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {FacebookService} from '../../../shared/_services/facebook.service';
import {GoogleAnalyticsService} from '../../../shared/_services/googleAnalytics.service';
import {YoutubeService} from '../../../shared/_services/youtube.service';
import {BsModalService} from 'ngx-bootstrap';
import {NgxLoadingModule} from 'ngx-loading';
import {FilterActions} from '../../dashboard/redux-filter/filter.actions';
import {ChartsCallsService} from '../../../shared/_services/charts_calls.service';
import {InstagramService} from '../../../shared/_services/instagram.service';
import {AggregatedDataService} from '../../../shared/_services/aggregated-data.service';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {UserService} from '../../../shared/_services/user.service';
import {AppFooterModule} from '@coreui/angular';
import {HttpClientModule} from '@angular/common/http';
import {FacebookMarketingService} from '../../../shared/_services/facebook-marketing.service';

@NgModule({
  declarations: [
    FeaturePreferencesApiKeysComponent,
    FeaturePreferencesApiKeysRegisterFormComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    AppFooterModule,
    HttpClientModule,
    NgxLoadingModule.forRoot({}),
    TranslateModule
  ],
  providers: [
    ApiKeysService,
    FacebookService,
    InstagramService,
    GoogleAnalyticsService,
    YoutubeService,
    AggregatedDataService,
    BsModalService,
    BreadcrumbActions,
    FilterActions,
    ChartsCallsService,
    FacebookMarketingService,
    UserService
  ],
  exports: [
    FeaturePreferencesApiKeysComponent,
    FeaturePreferencesApiKeysRegisterFormComponent
  ]
})

export class FeaturePreferencesApiKeysModule { }
