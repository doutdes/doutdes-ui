import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeatureMessageComponent} from './message.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: FeatureMessageComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class FeatureMessageRoutingModule {
}
