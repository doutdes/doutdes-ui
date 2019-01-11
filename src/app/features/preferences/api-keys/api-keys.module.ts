import {NgModule} from '@angular/core';
import {SharedModule} from '../../../shared/shared.module';
import {CoreModule} from '../../../core/core.module';
import {FeaturePreferencesApiKeysComponent} from './api-keys.component';
import {ApiKeysService} from '../../../shared/_services/apikeys.service';
import {FeaturePreferencesApiKeysRegisterFormComponent} from './register-form/register-form.component';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {AuthServiceConfig, SocialLoginModule} from 'angularx-social-login';

@NgModule({
  declarations: [
    FeaturePreferencesApiKeysComponent,
    FeaturePreferencesApiKeysRegisterFormComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    SocialLoginModule
  ],
  providers: [
    ApiKeysService,
    BreadcrumbActions
  ],
  exports: [
    FeaturePreferencesApiKeysComponent,
    FeaturePreferencesApiKeysRegisterFormComponent
  ]
})

export class FeaturePreferencesApiKeysModule { }
