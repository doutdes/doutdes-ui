import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

/** App Components **/
import {FeatureComponent} from './feature.component';
import {AccessGuard} from '../shared/_guards/AccessGuard';
import {FeatureDashboardModule} from './dashboard/dashboard.module';

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
            loadChildren: './dashboard/dashboard.module#FeatureDashboardModule',
            canActivate: [
              AccessGuard
            ],
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
  ], exports: [RouterModule]
})
export class FeatureRoutingModule {
}
