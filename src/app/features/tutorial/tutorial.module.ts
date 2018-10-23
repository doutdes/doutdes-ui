import {NgModule} from '@angular/core';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {CoreModule} from '../../core/core.module';
import {CommonModule} from '@angular/common';
import {FeatureTutorialRoutingModule} from './tutorial.routing';
import {FeatureTutorialComponent} from './tutorial.component';

@NgModule({
  declarations: [
    FeatureTutorialComponent
  ],
  imports: [
    CoreModule,
    CommonModule,
    FeatureTutorialRoutingModule
  ],
  providers: [
    BreadcrumbActions
  ],
  exports: [
    FeatureTutorialComponent
  ]
})

export class FeatureTutorialModule { }
