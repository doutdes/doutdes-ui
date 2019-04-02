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
        component: FeatureDashboardComponent
      },
      {
        path: 'facebook',
        component: FeatureDashboardFacebookComponent
      },
      {
        path: 'google',
        component: FeatureDashboardGoogleAnalyticsComponent
      },
      {
        path: 'custom',
        component: FeatureDashboardCustomComponent
      },
      {
        path: 'instagram',
        component: FeatureDashboardInstagramComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class FeatureDashboardRoutingModule {
}
