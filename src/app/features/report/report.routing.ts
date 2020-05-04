import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeatureReportComponent} from './report.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: FeatureReportComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class FeatureReportRoutingModule {
}
