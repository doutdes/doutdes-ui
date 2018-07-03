import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeatureAuthenticationLoginComponent} from './login/login.component';
import {FeatureAuthenticationRegisterComponent} from './register/register.component';


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
        component: FeatureAuthenticationRegisterComponent
      }
    ])
  ],
  exports: [RouterModule]
})

export class FeatureAuthenticationRoutingModule { }
