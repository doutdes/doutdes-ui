import {NgModule} from '@angular/core';
import {AppFooterModule} from '@coreui/angular';
import {SharedModule} from '../../shared/shared.module';
import {CoreModule} from '../../core/core.module';
import {FeatureDashboardComponent} from './dashboard.component';
import {FeatureDashboardRoutingModule} from './dashboard.routing';

@NgModule({
  declarations: [
    FeatureDashboardComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    AppFooterModule,
    FeatureDashboardRoutingModule
  ],
  providers: [

  ],
  exports: [
    FeatureDashboardComponent
  ]
})

export class FeatureDashboardModule { }
