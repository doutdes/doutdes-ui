import {Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {StoreService} from '../../../shared/_services/store.service';
import {DomSanitizer} from '@angular/platform-browser';
import {UserService} from '../../../shared/_services/user.service';
import {ToastrService} from 'ngx-toastr';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {Router} from '@angular/router';
import {User} from '../../../shared/_models/User';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PasswordValidation} from '../../authentication/validators/password-validator.directive';
import {FiscalCodeValidation} from '../../authentication/validators/fiscal-code-validator.directive';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {LoginActions} from '../../authentication/login/login.actions';

@Component({
  selector: 'app-feature-preferences-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FeaturePreferencesProfileComponent implements OnInit, OnDestroy {
  user: any = null;

  updateRegistration: FormGroup;
  selectedUser = 0;
  loading = false;
  submitted = false;
  modalRef: BsModalRef;

  @ViewChild('updateInfo') updateInfo: ElementRef;

  constructor(
    private _sanitizer: DomSanitizer,
    private userService: UserService,
    private localService: StoreService,
    private router: Router,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private loginActions: LoginActions,
    private breadcrumbActions: BreadcrumbActions,
  ) {
  }

  ngOnInit(): void {
    this.addBreadcrumb();

    this.userService.get().subscribe(user => {
      this.user = user;
      this.updateRegistration = this.formBuilder.group({
        first_name: [this.user.first_name, Validators.compose([Validators.maxLength(40), Validators.required])],
        last_name: [this.user.last_name, Validators.compose([Validators.maxLength(40), Validators.required])],
        birth_place: [this.user.birth_place, Validators.compose([Validators.maxLength(50), Validators.required])],
        birth_date: [this.user.birth_date, Validators.required],
        fiscal_code: [this.user.fiscal_code, Validators.compose([Validators.maxLength(16), Validators.required])],
        email_paypal: [this.user.email_paypal, Validators.compose([Validators.maxLength(50)])],
        address: [this.user.address, Validators.compose([Validators.maxLength(100), Validators.required])],
        city: [this.user.city, Validators.compose([Validators.maxLength(50), Validators.required])],
        zip: [this.user.zip, Validators.compose([Validators.maxLength(5), Validators.required])],
        province: [this.user.province, Validators.compose([Validators.maxLength(2), Validators.required])],
        username: [this.user.username, Validators.compose([Validators.maxLength(20), Validators.required])],
        email: [this.user.email, Validators.required],
        password: [null, Validators.compose([Validators.required])],
        r_password: [null, Validators.compose([Validators.required])],
        company_name: [this.user.company_name],
        vat_number: [this.user.vat_number, Validators.compose([Validators.maxLength(11)])]
      }, {
        validator: Validators.compose([PasswordValidation.MatchPassword, FiscalCodeValidation.CheckFiscalCode])
      });
      this.selectChangeHandler(this.user.user_type);
    });
  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }

  get f() {
    return this.updateRegistration.controls;
  }

  selectChangeHandler(user_type) {
    this.selectedUser = Number(user_type);

    if (this.selectedUser !== 2) {
      this.updateRegistration.controls['company_name'].setValidators(Validators.required);
      this.updateRegistration.controls['company_name'].updateValueAndValidity();

      this.updateRegistration.controls['vat_number'].setValidators(Validators.required);
      this.updateRegistration.controls['vat_number'].updateValueAndValidity();
    } else {
      this.updateRegistration.controls['company_name'].setValidators(null);
      this.updateRegistration.controls['company_name'].updateValueAndValidity();

      this.updateRegistration.controls['vat_number'].setValidators(null);
      this.updateRegistration.controls['vat_number'].updateValueAndValidity();
    }
  }

  onSubmit() {
    this.submitted = true;

    // If the registration form is invalid, return
    if (this.updateRegistration.invalid) {
      this.loading = false;
      return;
    }

    // Setting some fanValues to pass to the backend
    this.updateRegistration.value.user_type = this.selectedUser;

    // If the user is not a company, put the fanValues to null
    if (this.selectedUser === 2) {
      this.updateRegistration.value.company_name = null;
      this.updateRegistration.value.vat_number = null;
    }

    delete this.updateRegistration.value.r_password;

    this.loading = true;

    this.openModal(this.updateInfo);
  }

  updateUser() {
    const user = <User> this.updateRegistration.value;

    this.userService.update(user)
      .subscribe(
        data => {
          if (data['status']) {
            this.toastr.error('Si è verificato un errore durante l\'aggiornamento delle informazioni del profilo', 'Errore di aggiornamento');
          } else {
            this.toastr.success('Occorre ripetere il login.', 'Profilo aggiornato con successo!');
            this.loginActions.logoutUser();
          }
        }, error => {
          console.log(error);
          this.toastr.error('Si è verificato un errore durante l\'aggiornamento delle informazioni del profilo', 'Errore di aggiornamento');
        }
      );

    this.loading = false;
    this.closeModal();
  }

  openModal(template: ElementRef) {
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered'});
  }

  closeModal(): void {
    this.modalRef.hide();
  }

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Preferenze', '/preferences/'));
    bread.push(new Breadcrumb('Profilo', '/preferences/profile/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }
}
