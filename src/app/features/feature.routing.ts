import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

/** App Components **/
import {FeatureComponent} from './feature.component';
import {IsAuthenticatedGuard} from '../shared/_guards/is-authenticated.guard';
import {FeatureDashboardModule} from './dashboard/dashboard.module';
import {AuthenticationService} from './authentication/authentication.service';

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
            // canActivate: [
            //   IsAuthenticatedGuard
            // ],
            loadChildren: './dashboard/dashboard.module#FeatureDashboardModule',
            data: {
              title: 'Dashboard',
              requiresLogin: true
            },
          },
          {
            path: 'authentication',
            loadChildren: './authentication/authentication.module#FeatureAuthenticationModule'
          },
        ]
      }
    ])
  ],
  providers: [IsAuthenticatedGuard, AuthenticationService],
  exports: [RouterModule],
})
export class FeatureRoutingModule {
}
