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
    HttpClientModule
  ],
  providers: [
    GoogleAnalyticsService,
    BreadcrumbActions
  ],
  exports: [
    FeatureDashboardGoogleAnalyticsComponent
  ]
})

export class FeatureDashboardGoogleAnalyticsModule { }
