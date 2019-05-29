import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeatureAuthenticationLoginComponent} from './login/login.component';
import {FeatureAuthenticationRegisterComponent} from './register/register.component';
import {IsAdminGuard} from '../../shared/_guards/is-admin.guard';
import {FeatureAuthenticationAccountVerificationComponent} from './account-verification/account-verification.component';


@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        redirectTo: 'login'
      },
      {
        path: 'login',
        component: FeatureAuthenticationLoginComponent
      },
      {
        path: 'register',
        component: FeatureAuthenticationRegisterComponent,
        canActivate: [IsAdminGuard]
      },
      {
        path: 'account-verification',
        component: FeatureAuthenticationAccountVerificationComponent,
      }
    ])
  ],
  exports: [RouterModule],
  providers: [IsAdminGuard]
})

export class FeatureAuthenticationRoutingModule { }
