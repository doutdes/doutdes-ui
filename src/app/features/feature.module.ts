import {NgModule} from '@angular/core';
import {FeatureComponent} from './feature.component';
import {FeatureRoutingModule} from './feature.routing';
import {SharedModule} from '../shared/shared.module';
import {CoreModule} from '../core/core.module';
import {IsAuthenticatedGuard} from '../shared/_guards/is-authenticated.guard';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {P404Component} from '../errors/404.component';
import {P500Component} from '../errors/500.component';

@NgModule({
  declarations: [
    FeatureComponent,
    P404Component,
    P500Component
  ],
  imports: [
    FeatureRoutingModule,
    SharedModule,
    CoreModule,
    PerfectScrollbarModule,
  ],
  providers: [
    IsAuthenticatedGuard
  ],
  exports: [

  ]
})

export class FeatureModule { }
