import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeatureDashboardFacebookComponent} from './facebook/facebook.component';
import {FeatureDashboardGoogleAnalyticsComponent} from './googleAnalytics/googleAnalytics.component';
import {FeatureDashboardCustomComponent} from './custom/custom.component';
import {FeatureDashboardInstagramComponent} from './instagram/instagram.component';
import {FeatureDashboardYoutubeAnalyticsComponent} from './youtube/youtube.component';
import {FeatureDashboardComponent} from './dashboard.component';
import {FeatureDashboardFacebookMarketingComponent} from './facebook-marketing/facebook-marketing.component';

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
        path: 'facebook-marketing',
        component: FeatureDashboardFacebookMarketingComponent
      },
      {
        path: 'instagram',
        component: FeatureDashboardInstagramComponent
      },
      {
        path: 'youtube',
        component: FeatureDashboardYoutubeAnalyticsComponent
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
