import {Component, ViewEncapsulation} from '@angular/core';
import {select} from '@angular-redux/store';
import {AlertConfig} from 'ngx-bootstrap/alert';

@Component({
  selector: 'app-feature-authentication-login',
  templateUrl: './login.component.html',
  // styleUrls: ['./login.component.scss'],
  providers: [{ provide: AlertConfig, useFactory: getAlertConfig }],
  styles: [`
      :host {
        height: 80vh;
        display: block;
      }
    `
  ],
  encapsulation: ViewEncapsulation.Emulated
})
export class FeatureAuthenticationLoginComponent {
  @select() just_signed;

  constructor() { }

}

export function getAlertConfig(): AlertConfig {
  return Object.assign(new AlertConfig(), { type: 'success' });
}
