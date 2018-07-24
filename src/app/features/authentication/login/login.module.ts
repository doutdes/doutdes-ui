import { NgModule } from '@angular/core';
import {FeatureAuthenticationLoginFormComponent} from './login-form/login-form.component';
import {FeatureAuthenticationLoginComponent} from './login.component';
import {UserService} from '../../../shared/_services/user.service';
import {AuthenticationService} from '../authentication.service';
import {SharedModule} from '../../../shared/shared.module';
import {RouterLinkActive, RouterModule} from '@angular/router';
import {StoreService} from '../../../shared/_services/store.service';

@NgModule({
  declarations: [
    FeatureAuthenticationLoginFormComponent,
    FeatureAuthenticationLoginComponent
  ],
  imports: [
    SharedModule,
    RouterModule,
  ],
  exports: [
    FeatureAuthenticationLoginFormComponent,
    FeatureAuthenticationLoginComponent
  ],
  providers: [
    UserService,
    AuthenticationService,
    StoreService
  ]
})
export class LoginModule {}
