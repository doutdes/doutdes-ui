import {NgModule} from '@angular/core';
import {SharedModule} from '../../../shared/shared.module';
import {CoreModule} from '../../../core/core.module';
import {FeaturePreferencesApiKeysComponent} from './api-keys.component';


@NgModule({
  declarations: [
    FeaturePreferencesApiKeysComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
  ],
  providers: [
  ],
  exports: [
    FeaturePreferencesApiKeysComponent
  ]
})

export class FeaturePreferencesApiKeysModule { }
