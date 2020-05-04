import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {CoreModule} from '../../core/core.module';
import {FeaturePreferencesRoutingModule} from './preferences.routing';
import {FeaturePreferencesApiKeysModule} from './api-keys/api-keys.module';
import {FeaturePreferencesComponent} from './preferences.component';
import {FeaturePreferencesProfileComponent} from './profile/profile.component';
import {UserService} from '../../shared/_services/user.service';
import { LanguageComponent } from './language/language.component';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {HttpClient} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {AppModule} from '../../app.module';



@NgModule({
  declarations: [
    FeaturePreferencesComponent,
    FeaturePreferencesProfileComponent,
    LanguageComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    FeaturePreferencesApiKeysModule,
    FeaturePreferencesRoutingModule,
    TranslateModule
  ],
  providers: [
    UserService,
    BreadcrumbActions
  ],
  exports: [
    FeaturePreferencesComponent,
    FeaturePreferencesProfileComponent,
    //LanguageComponent
  ]
})

export class FeaturePreferencesModule { }
