import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {select} from '@angular-redux/store';
import {AlertConfig} from 'ngx-bootstrap/alert';
import {StoreService} from '../../../shared/_services/store.service';
import {ActivatedRoute, Router} from '@angular/router';
import {GlobalEventsManagerService} from '../../../shared/_services/global-event-manager.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-feature-authentication-login',
  templateUrl: './login.component.html',
  // styleUrls: ['./login.component.scss'],
  providers: [{provide: AlertConfig, useFactory: getAlertConfig}],
  styles: [`
    :host {
      height: 80vh;
      display: block;
    }
  `
  ],
  encapsulation: ViewEncapsulation.Emulated
})
export class FeatureAuthenticationLoginComponent implements OnInit {
  @select() just_signed;

  constructor(
    private storeLocal: StoreService,
    private route: ActivatedRoute,
    private geManager: GlobalEventsManagerService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.storeLocal.clear();
  }

  async ngOnInit() {
    const verified = this.route.snapshot.queryParamMap.get('verified');
    const token_verified = this.route.snapshot.queryParamMap.get('token_verified');

    if (verified === 'false') {
      this.toastr.error('Si è verificato un errore durante l\'autenticazione del tuo account.', 'Errore durante l\'accesso ai dati!');
      this.router.navigate([], {replaceUrl: true});
    }

    if (verified === 'true' && token_verified === 'false') {
      // tslint:disable-next-line:max-line-length
      this.toastr.success('La  verifica dell\'autenticazione del tuo account è avvenuta con successo.', 'Servizio configurato correttamente!');
      this.router.navigate([], {replaceUrl: true});
    }
    if (verified != null && verified === 'true' && token_verified != null && token_verified === 'true') {
      this.toastr.success('L\'email è stata già verificata.', 'Servizio già configurato correttamente!');
      this.router.navigate([], {replaceUrl: true});
    }
  }
}

export function getAlertConfig(): AlertConfig {
  return Object.assign(new AlertConfig(), {type: 'success'});
}
