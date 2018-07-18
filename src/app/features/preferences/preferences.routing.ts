import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeaturePreferencesApiKeysComponent} from './api-keys/api-keys.component';

/** App Components **/


@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        redirectTo: 'api-keys',
        pathMatch: 'full'
      },
      {
        path: 'api-keys',
        component: FeaturePreferencesApiKeysComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class FeaturePreferencesRoutingModule {
}
