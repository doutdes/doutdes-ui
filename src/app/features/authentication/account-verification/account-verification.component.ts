import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {AlertConfig} from 'ngx-bootstrap/alert';
import {select} from '@angular-redux/store';
import {StoreService} from '../../../shared/_services/store.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../authentication.service';
import {CredentialsVerification} from './account-verification.model';
import {first} from 'rxjs/operators';
import {UserService} from '../../../shared/_services/user.service';
import {ToastrService} from 'ngx-toastr';
import {validate} from 'codelyzer/walkerFactory/walkerFn';

@Component({
  selector: 'app-feature-authentication-account-verification',
  templateUrl: './account-verification.component.html',
  styleUrls: ['./account-verification.component.scss'],
  styles: [`
    :host {
      height: 80vh;
      display: block;
    }
  `
  ],
  encapsulation: ViewEncapsulation.None
})
export class FeatureAuthenticationAccountVerificationComponent implements OnInit {
  @select() just_signed;

  verificationForm: FormGroup;
  credentials: CredentialsVerification;
  loading = false;
  submitted = false;
  returnUrl: string;
  failed = false;

  constructor(
    private storeLocal: StoreService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.storeLocal.clear();
  }

  ngOnInit(): void {

    const token_validation = this.route.snapshot.queryParamMap.get('token_validation');
    const verified = this.route.snapshot.queryParamMap.get('verified');
    const email_validation = this.route.snapshot.queryParamMap.get('email_validation');
    /* const token_failed = this.route.snapshot.queryParamMap.get('token_failed'); */

    if (verified === 'false' && verified != null) {
      if (token_validation != null && token_validation === 'false') {
        this.toastr.error('C\'è stato qualche problema con il token.', 'Errore convalidazione!');
        this.router.navigate([], {replaceUrl: true});
      }
    }

    if (verified === 'false' && verified != null) {
      if (email_validation != null && email_validation === 'false') {

      }
    }

    this.verificationForm = this.formBuilder.group({
      email: ['', Validators.required],
      token: ['', Validators.required],
    });

    this.returnUrl = '';

  }

  get f() {
    return this.verificationForm.controls;
  }

  onSubmit() {
    // If submitted, the validators start
    this.submitted = true;

    // If the form is invalid, don't go ahead
    if (this.verificationForm.invalid) {
      return;
    }

    // At this point, all validators are true
    this.loading = true;


    this.userService.verifyEmail(this.f.token.value, this.f.email.value)
      .pipe(first())
      .subscribe(
        data => {
          console.warn('dati ricevuti: ', data);
          if (data.verified === true) {
            this.toastr.success('L\'email è stata già verificata.', 'Servizio già configurato correttamente!');
            this.router.navigate(['authentication/login']);
          } else {
            // tslint:disable-next-line:max-line-length
            this.toastr.success('La  verifica dell\'autenticazione del tuo account è avvenuta con successo.', 'Servizio configurato correttamente!');
            this.router.navigate(['authentication/login']);
          }
        }, error => {
          //console.error(error);
          this.toastr.error('C\'è stato qualche problema con l\'email.', 'Errore convalidazione!');
          this.router.navigate([], {replaceUrl: true});
          /*
          this.loading = false;
          this.failed = true;
           */
        }
      );
  }

}
