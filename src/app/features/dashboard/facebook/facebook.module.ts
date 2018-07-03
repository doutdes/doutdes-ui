import {NgModule} from '@angular/core';
import {AppFooterModule} from '@coreui/angular';
import {SharedModule} from '../../../shared/shared.module';
import {CoreModule} from '../../../core/core.module';
import {FeatureDashboardFacebookComponent} from './facebook.component';

@NgModule({
  declarations: [
    FeatureDashboardFacebookComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    AppFooterModule
  ],
  providers: [

  ],
  exports: [
    FeatureDashboardFacebookComponent
  ]
})

export class FeatureDashboardFacebookModule { }
