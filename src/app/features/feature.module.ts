import {NgModule} from '@angular/core';
import {FeatureComponent} from './feature.component';
import {FeatureRoutingModule} from './feature.routing';
import {SharedModule} from '../shared/shared.module';
import {CoreModule} from '../core/core.module';
import {AccessGuard} from '../shared/_guards/AccessGuard';
import {AppFooterModule, AppSidebarModule} from '@coreui/angular';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';

@NgModule({
  declarations: [
    FeatureComponent
  ],
  imports: [
    FeatureRoutingModule,
    SharedModule,
    CoreModule,
    AppSidebarModule,
    AppFooterModule,
    PerfectScrollbarModule,
  ],
  providers: [
    AccessGuard
  ],
  exports: [

  ]
})

export class FeatureModule { }
