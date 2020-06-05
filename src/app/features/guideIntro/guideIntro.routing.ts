import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {GuideIntroComponent} from './guideIntro.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: GuideIntroComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class GuideIntroRoutingModule {
}
