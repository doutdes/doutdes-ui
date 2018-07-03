import {NgModule} from '@angular/core';
import {FeatureComponent} from './feature.component';
import {FeatureRoutingModule} from './feature.routing';
import {SharedModule} from '../shared/shared.module';
import {CoreModule} from '../core/core.module';
import {AppFooterModule} from '@coreui/angular';
import {AccessGuard} from '../shared/_guards/AccessGuard';

@NgModule({
  declarations: [
    FeatureComponent
  ],
  imports: [
    FeatureRoutingModule,
    SharedModule,
    CoreModule,
    AppFooterModule
  ],
  providers: [
    AccessGuard
  ],
  exports: [

  ]
})

export class FeatureModule { }
