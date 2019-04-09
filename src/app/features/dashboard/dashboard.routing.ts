import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeatureDashboardFacebookComponent} from './facebook/facebook.component';
import {FeatureDashboardGoogleAnalyticsComponent} from './googleAnalytics/googleAnalytics.component';
import {FeatureDashboardCustomComponent} from './custom/custom.component';
import {FeatureDashboardInstagramComponent} from './instagram/instagram.component';
import {FeatureDashboardComponent} from './dashboard.component';

/** App Components **/


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
        component: FeatureDashboardGoogleAnalyticsComponent
      },
      {
        path: 'facebook',
        component: FeatureDashboardFacebookComponent
      },
      {
        path: 'instagram',
        component: FeatureDashboardInstagramComponent
      },
      {
        path: 'custom',
        component: FeatureDashboardCustomComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class FeatureDashboardRoutingModule {
}
