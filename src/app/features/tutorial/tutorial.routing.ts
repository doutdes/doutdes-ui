import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeatureTutorialComponent} from './tutorial.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: FeatureTutorialComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class FeatureTutorialRoutingModule {
}
