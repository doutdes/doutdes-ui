import {NgModule} from '@angular/core';
import {FeatureComponent} from './feature.component';
import {FeatureRoutingModule} from './feature.routing';
import {SharedModule} from '../shared/shared.module';
import {CoreModule} from '../core/core.module';
import {IsAuthenticatedGuard} from '../shared/_guards/is-authenticated.guard';
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
    IsAuthenticatedGuard
  ],
  exports: [

  ]
})

export class FeatureModule { }
