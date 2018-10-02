import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeatureDashboardFacebookComponent} from './facebook/facebook.component';
import {FeatureDashboardGoogleAnalyticsComponent} from './googleAnalytics/googleAnalytics.component';

/** App Components **/


@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        // component: FeatureDashboardComponent
        redirectTo: 'facebook',
        pathMatch: 'full'
      },
      {
        path: 'facebook',
        component: FeatureDashboardFacebookComponent
      },
      {
        path: 'google',
        component: FeatureDashboardGoogleAnalyticsComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class FeatureDashboardRoutingModule {
}
