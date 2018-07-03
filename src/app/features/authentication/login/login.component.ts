import {Component} from '@angular/core';
import {select} from '@angular-redux/store';
import {AlertConfig} from 'ngx-bootstrap/alert';

@Component({
  selector: 'app-feature-authentication-login',
  templateUrl: './login.component.html',
  providers: [{ provide: AlertConfig, useFactory: getAlertConfig }]
})
export class FeatureAuthenticationLoginComponent {
  @select() just_signed;

  constructor() { }

}

export function getAlertConfig(): AlertConfig {
  return Object.assign(new AlertConfig(), { type: 'success' });
}
