import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeatureAuthenticationLoginComponent} from './login/login.component';
import {FeatureAuthenticationRegisterComponent} from './register/register.component';
import {IsAdminGuard} from '../../shared/_guards/is-admin.guard';
import {FeatureAuthenticationAccountVerificationComponent} from './account-verification/account-verification.component';
import {IsNotAuthenticatedGuard} from '../../shared/_guards/is-not-authenticated.guard';


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
        canActivate: [IsNotAuthenticatedGuard]
      }
    ])
  ],
  exports: [RouterModule],
  providers: [IsAdminGuard, IsNotAuthenticatedGuard]
})

export class FeatureAuthenticationRoutingModule { }
