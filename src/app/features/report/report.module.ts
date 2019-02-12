import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {CoreModule} from '../../core/core.module';
import {FeatureReportComponent} from './report.component';
import {FeatureReportRoutingModule} from './report.routing';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';

@NgModule({
  declarations: [
    FeatureReportComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    FeatureReportRoutingModule
  ],
  providers: [
    BreadcrumbActions
  ],
  exports: [
    FeatureReportComponent
  ]
})

export class FeatureReportModule { }
