import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeatureTutorialGaComponent} from './google/tutorialGa.component';
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
        component: FeatureTutorialGaComponent
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
