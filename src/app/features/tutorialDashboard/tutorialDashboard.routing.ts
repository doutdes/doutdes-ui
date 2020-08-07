import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {tutorialDashboardComponent} from './tutorialDashboard.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: tutorialDashboardComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class TutorialDashboardRoutingModule {
}
