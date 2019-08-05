import {NgModule} from '@angular/core';
import {AppFooterModule} from '@coreui/angular';
import {SharedModule} from '../../../shared/shared.module';
import {CoreModule} from '../../../core/core.module';
import {RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {ChartsModule} from 'ng2-charts/ng2-charts';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {GoogleAnalyticsService} from '../../../shared/_services/googleAnalytics.service';
import {FilterActions} from '../redux-filter/filter.actions';
import {BsDatepickerModule, BsDropdownModule, BsLocaleService} from 'ngx-bootstrap';
import {NgxLoadingModule} from 'ngx-loading';
import {FeatureDashboardCustomComponent} from './custom.component';
import {FacebookService} from '../../../shared/_services/facebook.service';
import {InstagramService} from '../../../shared/_services/instagram.service';
import {YoutubeService} from '../../../shared/_services/youtube.service';

import {defineLocale} from 'ngx-bootstrap';
import {itLocale} from 'ngx-bootstrap/locale';
import {DragulaModule} from 'ng2-dragula';

defineLocale('it', itLocale);

@NgModule({
  declarations: [
    FeatureDashboardCustomComponent
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
    DragulaModule
  ],
  providers: [
    GoogleAnalyticsService,
    FacebookService,
    BreadcrumbActions,
    FilterActions,
    BsLocaleService,
    YoutubeService,
    InstagramService
  ],
  exports: [
    FeatureDashboardCustomComponent
  ]
})

export class FeatureDashboardCustomModule { }
