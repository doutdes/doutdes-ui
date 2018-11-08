import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeatureTutorialComponent} from './google/tutorial.component';
import {FeatureTutorialFbComponent} from './facebook/tutorialFb.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        redirectTo: 'google',
        pathMatch: 'full'
      },
      {
        path: 'google',
        component: FeatureTutorialComponent
      },
      {
        path: 'facebook',
        component: FeatureTutorialFbComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class FeatureTutorialRoutingModule {
}
