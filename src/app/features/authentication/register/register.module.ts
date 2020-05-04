import {NgModule} from '@angular/core';

import {UserService} from '../../../shared/_services/user.service';
import {AuthenticationService} from '../authentication.service';
import {FeatureAuthenticationRegisterFormComponent} from './register-form/register-form.component';
import {FeatureAuthenticationRegisterComponent} from './register.component';
import {SharedModule} from '../../../shared/shared.module';
import {RouterModule} from '@angular/router';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {ToastrService} from 'ngx-toastr';
import {StoreService} from '../../../shared/_services/store.service';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    FeatureAuthenticationRegisterFormComponent,
    FeatureAuthenticationRegisterComponent
  ],
  imports: [
    SharedModule,
    RouterModule,
    TranslateModule,
  ],
  exports: [
    FeatureAuthenticationRegisterFormComponent,
    FeatureAuthenticationRegisterComponent
  ],
  providers: [
    UserService,
    AuthenticationService,
    BreadcrumbActions,
    ToastrService,
    StoreService
  ]
})
export class RegisterModule {}
