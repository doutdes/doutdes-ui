import {NgModule} from '@angular/core';
import {SharedModule} from '../../../shared/shared.module';
import {CoreModule} from '../../../core/core.module';
import {FeaturePreferencesApiKeysComponent} from './api-keys.component';
import {ApiKeysService} from '../../../shared/_services/apikeys.service';
import {FeaturePreferencesApiKeysRegisterFormComponent} from './register-form/register-form.component';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {SocialLoginModule, AuthServiceConfig, LoginOpt, FacebookLoginProvider} from 'angularx-social-login';
import { GoogleLoginProvider} from 'angularx-social-login';

const googleLoginOptions: LoginOpt = {
  scope: 'https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/yt-analytics-monetary.readonly'
}; // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiauth2clientconfig

const fbLoginOptions: LoginOpt = {
  scope: 'read_insights,ads_read,instagram_manage_insights,manage_pages',
  return_scopes: true,
  enable_profile_selector: true
};

let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider('677265943833-pk2h68akq4u3o6elhcupu8bt89qg4cjl.apps.googleusercontent.com', googleLoginOptions)
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider('2465723383501355', fbLoginOptions)
  }
]);

export function provideConfig() {
  return config;
}

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
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    },
    ApiKeysService,
    BreadcrumbActions
  ],
  exports: [
    FeaturePreferencesApiKeysComponent,
    FeaturePreferencesApiKeysRegisterFormComponent
  ]
})

export class FeaturePreferencesApiKeysModule { }
