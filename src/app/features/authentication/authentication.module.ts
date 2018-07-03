import {NgModule} from '@angular/core';
import {AlertModule} from 'ngx-bootstrap/alert';
import {UserService} from '../../shared/_services/user.service';
import {AuthenticationService} from './authentication.service';
import {LoginModule} from './login/login.module';
import {RegisterModule} from './register/register.module';
import {FeatureAuthenticationRoutingModule} from './authentication.routing';
import {FeatureAuthenticationComponent} from './authentication.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  declarations: [
    FeatureAuthenticationComponent
  ],
  imports: [
    FeatureAuthenticationRoutingModule,
    LoginModule,
    RegisterModule,
    SharedModule
  ],
  providers: [
    AuthenticationService,
    UserService
  ],
  exports: [
    FeatureAuthenticationComponent
  ]
})

export class FeatureAuthenticationModule { }
