import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeatureCalendarComponent} from './calendar.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: FeatureCalendarComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class FeatureCalendarRoutingModule {
}
