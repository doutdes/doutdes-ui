import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeatureTutorialGaComponent} from './google/tutorialGa.component';
import {FeatureTutorialFbComponent} from './facebook/tutorialFb.component';
import {FeatureTutorialIgComponent} from './instagram/tutorialIg.component';
import {FeatureTutorialYTComponent} from './youtube/tutorialYT.component';

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
      },
      {
        path: 'instagram',
        component: FeatureTutorialIgComponent
      },
      {
        path: 'youtube',
        component: FeatureTutorialYTComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class FeatureTutorialRoutingModule {
}
