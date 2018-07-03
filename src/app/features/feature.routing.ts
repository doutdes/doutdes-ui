import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

/** App Components **/
import {FeatureComponent} from './feature.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: FeatureComponent,
        children: [
            {
              path: '',
              redirectTo: 'authentication',
              pathMatch: 'full'
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
export class FeatureRoutingModule { }
