import {NgModule} from '@angular/core';
import {UserService} from '../../shared/_services/user.service';
import {AuthenticationService} from './authentication.service';
import {LoginModule} from './login/login.module';
import {RegisterModule} from './register/register.module';
import {FeatureAuthenticationRoutingModule} from './authentication.routing';
import {FeatureAuthenticationComponent} from './authentication.component';
import {SharedModule} from '../../shared/shared.module';
import {FeatureAuthenticationAccountVerificationComponent} from './account-verification/account-verification.component';
import {IsNotAuthenticatedGuard} from '../../shared/_guards/is-not-authenticated.guard';
import {BsDropdownModule} from 'ngx-bootstrap';

@NgModule({
  declarations: [
    FeatureAuthenticationComponent,
    FeatureAuthenticationAccountVerificationComponent
  ],
  imports: [
    FeatureAuthenticationRoutingModule,
    LoginModule,
    RegisterModule,
    SharedModule,
    BsDropdownModule
  ],
  providers: [
    AuthenticationService,
    UserService
  ],
  exports: [
    FeatureAuthenticationComponent,
    FeatureAuthenticationAccountVerificationComponent
  ]
})

export class FeatureAuthenticationModule { }
