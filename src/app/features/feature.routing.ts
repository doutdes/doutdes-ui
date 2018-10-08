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
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          {
            path: 'dashboard',
            canActivate: [
              IsAuthenticatedGuard
            ],
            loadChildren: './dashboard/dashboard.module#FeatureDashboardModule',
          },
          {
            path: 'preferences',
            canActivate: [
              IsAuthenticatedGuard
            ],
            loadChildren: './preferences/preferences.module#FeaturePreferencesModule',
          },
          {
            path: 'authentication',
            loadChildren: './authentication/authentication.module#FeatureAuthenticationModule'
          },
          {
            path: 'calendar',
            canActivate: [
              IsAuthenticatedGuard
            ],
            loadChildren: './calendar/calendar.module#FeatureCalendarModule'
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
