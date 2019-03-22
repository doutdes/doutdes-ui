import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeaturePreferencesApiKeysComponent} from './api-keys/api-keys.component';
import {FeaturePreferencesApiKeysRegisterFormComponent} from './api-keys/register-form/register-form.component';

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
      },
      // {
      //   path: 'api-keys/:err',
      //   component: FeaturePreferencesApiKeysComponent
      // },
      {
        path: 'api-keys/insert',
        component: FeaturePreferencesApiKeysRegisterFormComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class FeaturePreferencesRoutingModule {
}
