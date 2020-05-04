import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeaturePreferencesApiKeysComponent} from './api-keys/api-keys.component';
import {FeaturePreferencesApiKeysRegisterFormComponent} from './api-keys/register-form/register-form.component';
import {FeaturePreferencesProfileComponent} from './profile/profile.component';
import {LanguageComponent} from './language/language.component';

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
      {
        path: 'profile',
        component: FeaturePreferencesProfileComponent
      },
      {
        path: 'api-keys/insert',
        component: FeaturePreferencesApiKeysRegisterFormComponent
      },
      {
        path: 'language',
        component: LanguageComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class FeaturePreferencesRoutingModule {
}
