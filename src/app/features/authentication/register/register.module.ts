import { NgModule } from '@angular/core';

import {UserService} from '../../../shared/_services/user.service';
import {AuthenticationService} from '../authentication.service';
import {FeatureAuthenticationRegisterFormComponent} from './register-form/register-form.component';
import {FeatureAuthenticationRegisterComponent} from './register.component';
import {SharedModule} from '../../../shared/shared.module';
import {RouterLinkActive, RouterModule} from '@angular/router';

@NgModule({
  declarations: [
    FeatureAuthenticationRegisterFormComponent,
    FeatureAuthenticationRegisterComponent
  ],
  imports: [
    SharedModule,
    RouterModule,
  ],
  exports: [
    FeatureAuthenticationRegisterFormComponent,
    FeatureAuthenticationRegisterComponent
  ],
  providers: [
    UserService,
    AuthenticationService
  ]
})
export class RegisterModule {}
