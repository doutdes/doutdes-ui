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
import {FeatureDashboardGoogleAnalyticsComponent} from './googleAnalytics.component';
import {FilterActions} from '../redux-filter/filter.actions';
import {BsDatepickerModule, BsDropdownModule, BsLocaleService} from 'ngx-bootstrap';
import {ngxLoadingAnimationTypes, NgxLoadingModule} from 'ngx-loading';
import {UserService} from '../../../shared/_services/user.service';

import {defineLocale} from 'ngx-bootstrap';
import {itLocale} from 'ngx-bootstrap/locale';
import {DragulaModule} from 'ng2-dragula';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    FeatureDashboardGoogleAnalyticsComponent
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
    NgxLoadingModule.forRoot({
      animationType: ngxLoadingAnimationTypes.threeBounce,
      backdropBackgroundColour: 'rgba(0,0,0,0.1)',
      backdropBorderRadius: '4px',
      primaryColour: '#FFF',
      secondaryColour: '#FFF',
      fullScreenBackdrop: true
    }),
    DragulaModule,
    TranslateModule
  ],
  providers: [
    GoogleAnalyticsService,
    BreadcrumbActions,
    UserService,
    FilterActions,
    BsLocaleService,
    UserService
  ],
  exports: [
    FeatureDashboardGoogleAnalyticsComponent
  ]
})

export class FeatureDashboardGoogleAnalyticsModule { }
