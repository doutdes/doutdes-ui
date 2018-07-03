import {NgModule} from '@angular/core';
import {AppFooterModule} from '@coreui/angular';
import {SharedModule} from '../../shared/shared.module';
import {CoreModule} from '../../core/core.module';
import {FeatureDashboardComponent} from './dashboard.component';
import {FeatureDashboardRoutingModule} from './dashboard.routing';
import {FeatureDashboardFacebookModule} from './facebook/facebook.module';

@NgModule({
  declarations: [
    FeatureDashboardComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    AppFooterModule,
    FeatureDashboardFacebookModule,
    FeatureDashboardRoutingModule
  ],
  providers: [

  ],
  exports: [
    FeatureDashboardComponent
  ]
})

export class FeatureDashboardModule { }
