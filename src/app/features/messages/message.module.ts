import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {CoreModule} from '../../core/core.module';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {FeatureMessageRoutingModule} from './message.routing';
import {FeatureMessageComponent} from './message.component';

@NgModule({
  declarations: [
    FeatureMessageComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    FeatureMessageRoutingModule
  ],
  providers: [
    BreadcrumbActions
  ],
  exports: [
    FeatureMessageComponent
  ]
})

export class FeatureMessageModule { }
