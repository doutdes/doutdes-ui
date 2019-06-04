import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {select} from '@angular-redux/store';
import {StoreService} from '../../../shared/_services/store.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs/operators';
import {UserService} from '../../../shared/_services/user.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-feature-authentication-account-verification',
  templateUrl: './account-verification.component.html',
  styleUrls: ['./account-verification.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class FeatureAuthenticationAccountVerificationComponent implements OnInit {
  @select() just_signed;

  verificationForm: FormGroup;
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

    if (verified === 'false' && verified != null && token_validation != null && token_validation === 'false') {
        this.toastr.error('C\'è stato qualche problema con il token.', 'Errore convalidazione!');
        this.router.navigate([], {replaceUrl: true});

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
          if (data.verified === true) {
            this.toastr.success('L\'email è stata già verificata.', 'Servizio già configurato correttamente!');
            this.router.navigate(['authentication/login']);
          } else {
            this.toastr.success('La  verifica dell\'autenticazione del tuo account è avvenuta con successo.', 'Servizio configurato correttamente!');
            this.router.navigate(['authentication/login']);
          }
        }, error => {
          console.error(error);
          this.toastr.error('C\'è stato qualche problema con l\'email.', 'Errore convalidazione!');
          this.router.navigate([], {replaceUrl: true});

          this.loading = false;
          this.failed = true;

        }
      );
  }

}
