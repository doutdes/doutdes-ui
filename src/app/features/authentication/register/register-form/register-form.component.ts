import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PasswordValidation} from '../../validators/password-validator.directive';
import {FiscalCodeValidation} from '../../validators/fiscal-code-validator.directive';
import {UserService} from '../../../../shared/_services/user.service';
import {User} from '../../../../shared/_models/User';
import {first} from 'rxjs/internal/operators';
import {Router} from '@angular/router';
import {NgRedux, select} from '@angular-redux/store';
import {IAppState} from '../../../../shared/store/model';
import {ToastrService} from 'ngx-toastr';
import {StoreService} from '../../../../shared/_services/store.service';
import {TranslateService} from '@ngx-translate/core';
import {GlobalEventsManagerService} from '../../../../shared/_services/global-event-manager.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-feature-authentication-register-form',
  templateUrl: './register-form.component.html'
})
export class FeatureAuthenticationRegisterFormComponent implements OnInit {

  @select() username;
  @select() just_signed;

  registrationForm: FormGroup;
  selectedUser = 'company';
  loading = false;
  submitted = false;

  user: User;
  value: string;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private storeService: StoreService,
    private router: Router,
    private ngRedux: NgRedux<IAppState>,
    private toastr: ToastrService,
    public translate: TranslateService,
    private GEService: GlobalEventsManagerService,
    private http: HttpClient
  ) {
  }

  ngOnInit(): void {
    this.registrationForm = this.formBuilder.group({
      first_name:  ['', Validators.compose([Validators.maxLength(40), Validators.required])],
      last_name:   ['', Validators.compose([Validators.maxLength(40), Validators.required])],
      birth_place: ['', Validators.compose([Validators.maxLength(50), Validators.required])],
      birth_date:  ['', Validators.required],
      fiscal_code: ['', Validators.compose([Validators.maxLength(16), Validators.required])],
      address:     ['', Validators.compose([Validators.maxLength(100), Validators.required])],
      city:        ['', Validators.compose([Validators.maxLength(50), Validators.required])],
      zip:         ['', Validators.compose([Validators.maxLength(5), Validators.required])],
      province:    ['', Validators.compose([Validators.maxLength(2), Validators.required])],
      username:    ['', Validators.compose([Validators.maxLength(40), Validators.required])],
      email:       ['', Validators.required],
      password:    ['', Validators.compose([Validators.minLength(10), Validators.required])],
      r_password:  ['', Validators.compose([Validators.minLength(10), Validators.required])],
      company_name: [],
      vat_number: []
    }, {
      validator: Validators.compose([PasswordValidation.MatchPassword]) // FiscalCodeValidation.CheckFiscalCode]) TODO: fix fiscal code check
    });

    if (this.selectedUser === 'company') {
      this.registrationForm.controls['company_name'].setValidators(Validators.required);
      this.registrationForm.controls['company_name'].updateValueAndValidity();

      this.registrationForm.controls['vat_number'].setValidators(Validators.required);
      this.registrationForm.controls['vat_number'].updateValueAndValidity();

      this.registrationForm.controls['birth_place'].setValidators(null);
      this.registrationForm.controls['birth_place'].updateValueAndValidity();

      this.registrationForm.controls['birth_date'].setValidators(null);
      this.registrationForm.controls['birth_date'].updateValueAndValidity();

      this.registrationForm.controls['fiscal_code'].setValidators(null);
      this.registrationForm.controls['fiscal_code'].updateValueAndValidity();

    } else {
      this.registrationForm.controls['company_name'].setValidators(null);
      this.registrationForm.controls['company_name'].updateValueAndValidity();

      this.registrationForm.controls['vat_number'].setValidators(null);
      this.registrationForm.controls['vat_number'].updateValueAndValidity();
    }

  }

  get f() { return this.registrationForm.controls; }

  selectChangeHandler (event: any) {
    this.selectedUser = event.target.value;

    if (this.selectedUser === 'company') {
      this.registrationForm.controls['company_name'].setValidators(Validators.required);
      this.registrationForm.controls['company_name'].updateValueAndValidity();

      this.registrationForm.controls['vat_number'].setValidators(Validators.required);
      this.registrationForm.controls['vat_number'].updateValueAndValidity();

      this.registrationForm.controls['birth_place'].setValidators(null);
      this.registrationForm.controls['birth_place'].updateValueAndValidity();

      this.registrationForm.controls['birth_date'].setValidators(null);
      this.registrationForm.controls['birth_date'].updateValueAndValidity();

      this.registrationForm.controls['fiscal_code'].setValidators(null);
      this.registrationForm.controls['fiscal_code'].updateValueAndValidity();
    } else {
      this.registrationForm.controls['company_name'].setValidators(null);
      this.registrationForm.controls['company_name'].updateValueAndValidity();

      this.registrationForm.controls['vat_number'].setValidators(null);
      this.registrationForm.controls['vat_number'].updateValueAndValidity();
    }
  }

  onSubmit() {

    this.submitted = true;

    // If the registration form is invalid, return
    if (this.registrationForm.invalid) {

      console.log('Some fields are invalid!');
      this.loading = false;
      return;
    }

    // Setting some fanValues to pass to the backend
    this.registrationForm.value.user_type = this.selectedUser;
    this.registrationForm.value.id = 0;
    this.registrationForm.value.checksum = 0;

    // If the user is not a company, put the fanValues to null
    if (this.selectedUser !== 'company') {
      this.registrationForm.value.company_name = null;
      this.registrationForm.value.vat_number = null;
    }

    delete this.registrationForm.value.r_password;

    this.loading = true;

    this.userService.register(<User> this.registrationForm.value)
      .pipe(first())
      .subscribe(
        data => {
          // this.setSignedUp(this.registrationForm.value.username);
          //
          if (parseInt(this.storeService.getType()) === 0){
            this.toastr.success('L\'account \'' + this.registrationForm.value.username + '\' è stato creato con successo.', 'Account creato!');
          }
          else {
            this.toastr.success('Complimenti, hai creato l\'account ' + this.registrationForm.value.username, 'Account creato!');
            this.router.navigate(['authentication/login']);
          }

          this.registrationForm.controls.company_name.setValue("");
          this.registrationForm.controls.vat_number.setValue("");
          this.registrationForm.controls.first_name.setValue("");
          this.registrationForm.controls.last_name.setValue("");
          this.registrationForm.controls.birth_place.setValue("");
          this.registrationForm.controls.birth_date.setValue("");
          this.registrationForm.controls.fiscal_code.setValue("");
          this.registrationForm.controls.address.setValue("");
          this.registrationForm.controls.city.setValue("");
          this.registrationForm.controls.zip.setValue("");
          this.registrationForm.controls.province.setValue("");
          this.registrationForm.controls.username.setValue("");
          this.registrationForm.controls.email.setValue("");
          this.registrationForm.controls.password.setValue("");
          this.registrationForm.controls.r_password.setValue("");

          this.submitted = false;
          this.loading = false;
        }, error => {
          this.loading = false;

          this.toastr.error('L\'email o l\'username di \'' + this.registrationForm.value.username + '\' esistono già.', 'Creazione fallita!');

          console.log(error);
          console.log('User or email already exists');
        }
      );
  }

  conversionSetDefaultLang () {

    switch (this.user.lang) {
      case "it" :
        this.value = "Italiano";
        break;
      case "en" :
        this.value = "English";
        break;
      default:
        this.value = "Italiano";
    }

    return this.value;
  }

}
