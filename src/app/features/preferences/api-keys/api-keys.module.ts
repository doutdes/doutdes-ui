import {NgModule} from '@angular/core';
import {SharedModule} from '../../../shared/shared.module';
import {CoreModule} from '../../../core/core.module';
import {FeaturePreferencesApiKeysComponent} from './api-keys.component';
import {ApiKeysService} from '../../../shared/_services/apikeys.service';
import {FeaturePreferencesApiKeysRegisterFormComponent} from './register-form/register-form.component';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {FacebookService} from '../../../shared/_services/facebook.service';

@NgModule({
  declarations: [
    FeaturePreferencesApiKeysComponent,
    FeaturePreferencesApiKeysRegisterFormComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
  ],
  providers: [
    ApiKeysService,
    FacebookService,
    BreadcrumbActions
  ],
  exports: [
    FeaturePreferencesApiKeysComponent,
    FeaturePreferencesApiKeysRegisterFormComponent
  ]
})

export class FeaturePreferencesApiKeysModule { }
