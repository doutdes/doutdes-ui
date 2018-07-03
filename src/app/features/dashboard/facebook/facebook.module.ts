import {NgModule} from '@angular/core';
import {AppFooterModule} from '@coreui/angular';
import {SharedModule} from '../../../shared/shared.module';
import {CoreModule} from '../../../core/core.module';
import {FeatureDashboardFacebookComponent} from './facebook.component';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [
    FeatureDashboardFacebookComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    AppFooterModule,
    RouterModule
  ],
  providers: [

  ],
  exports: [
    FeatureDashboardFacebookComponent
  ]
})

export class FeatureDashboardFacebookModule { }
