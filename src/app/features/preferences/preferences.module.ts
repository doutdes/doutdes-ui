import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {CoreModule} from '../../core/core.module';
import {FeaturePreferencesRoutingModule} from './preferences.routing';
import {FeaturePreferencesApiKeysModule} from './api-keys/api-keys.module';
import {FeaturePreferencesComponent} from './preferences.component';
import {FeaturePreferencesProfileComponent} from './profile/profile.component';

@NgModule({
  declarations: [
    FeaturePreferencesComponent,
    FeaturePreferencesProfileComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    FeaturePreferencesApiKeysModule,
    FeaturePreferencesRoutingModule,
  ],
  providers: [

  ],
  exports: [
    FeaturePreferencesComponent,
    FeaturePreferencesProfileComponent
  ]
})

export class FeaturePreferencesModule { }
