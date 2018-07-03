import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeatureDashboardComponent} from './dashboard.component';
import {FeatureDashboardFacebookComponent} from './facebook/facebook.component';

/** App Components **/


@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        redirectTo: 'facebook',
        pathMatch: 'full'
      },
      {
        path: 'facebook',
        component: FeatureDashboardFacebookComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class FeatureDashboardRoutingModule {
}
