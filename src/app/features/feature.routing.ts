import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

/** App Components **/
import {FeatureComponent} from './feature.component';
import {IsAuthenticatedGuard} from '../shared/_guards/is-authenticated.guard';
import {AuthenticationService} from './authentication/authentication.service';
import {P404Component} from '../errors/404.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: FeatureComponent,
        children: [
          {
            path: '',
            canActivate: [
              IsAuthenticatedGuard
            ],
            loadChildren: './home/home.module#HomeModule'
          },
          {
            path: 'report',
            canActivate: [
              IsAuthenticatedGuard
            ],
            loadChildren: './report/report.module#FeatureReportModule'
          },
          {
            path: 'dashboard',
            canActivate: [
              IsAuthenticatedGuard
            ],
            loadChildren: './dashboard/dashboard.module#FeatureDashboardModule',
          },
          {
            path: 'authentication',
            loadChildren: './authentication/authentication.module#FeatureAuthenticationModule'
          },
          {
            path: 'preferences',
            canActivate: [
              IsAuthenticatedGuard
            ],
            loadChildren: './preferences/preferences.module#FeaturePreferencesModule',
          },
          {
            path: 'calendar',
            canActivate: [
              IsAuthenticatedGuard
            ],
            loadChildren: './calendar/calendar.module#FeatureCalendarModule'
          },
          {
            path: 'messages',
            canActivate: [
              IsAuthenticatedGuard
            ],
            loadChildren: './messages/message.module#FeatureMessageModule'
          },
          {
            path: 'tutorial',
            canActivate: [
              IsAuthenticatedGuard
            ],
            loadChildren: './tutorial/tutorial.module#FeatureTutorialModule'
          },
          {
            path: 'guideIntro',
            canActivate: [
              IsAuthenticatedGuard
            ],
            loadChildren: './guideIntro/guideIntro.module#FeautureGuideIntroModule'
          },
          {
            path: 'tutorialDashboard',
            canActivate: [
              IsAuthenticatedGuard
            ],
            loadChildren: './tutorialDashboard/tutorialDashboard.module#FeatureTutorialDashboardModule'
          }
        ],
      },
      {
        path: '**',
        component: P404Component
      }
    ])
  ],
  providers: [IsAuthenticatedGuard, AuthenticationService],
  exports: [RouterModule],
})
export class FeatureRoutingModule {
}
