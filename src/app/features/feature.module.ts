import {NgModule} from '@angular/core';
import {FeatureComponent} from './feature.component';
import {FeatureRoutingModule} from './feature.routing';
import {SharedModule} from '../shared/shared.module';
import {CoreModule} from '../core/core.module';
import {AppFooterModule} from '@coreui/angular';

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

  ],
  exports: [

  ]
})

export class FeatureModule { }
