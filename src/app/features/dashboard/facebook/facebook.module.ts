import {NgModule} from '@angular/core';
import {AppFooterModule} from '@coreui/angular';
import {SharedModule} from '../../../shared/shared.module';
import {CoreModule} from '../../../core/core.module';
import {FeatureDashboardFacebookComponent} from './facebook.component';
import {RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {FacebookService} from '../../../shared/_services/facebook.service';
import {ChartsModule} from 'ng2-charts/ng2-charts';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {DashboardService} from '../../../shared/_services/dashboard.service';
import {ChartsCallsService} from '../../../shared/_services/charts_calls.service';
import {GlobalEventsManagerService} from '../../../shared/_services/global-event-manager.service';
import {BsDatepickerModule, BsDropdownModule} from 'ngx-bootstrap';
import {FilterActions} from '../redux-filter/filter.actions';


@NgModule({
  declarations: [
    FeatureDashboardFacebookComponent
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
    BsDropdownModule.forRoot()
  ],
  providers: [
    FacebookService,
    DashboardService,
    ChartsCallsService,
    BreadcrumbActions,
    FilterActions,
    GlobalEventsManagerService
  ],
  exports: [
    FeatureDashboardFacebookComponent
  ]
})

export class FeatureDashboardFacebookModule { }
