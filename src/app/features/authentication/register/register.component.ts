import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PasswordValidation} from '../validators/password-validator.directive';
import {FiscalCodeValidation} from '../validators/fiscal-code-validator.directive';
import {UserService} from '../../../shared/_services/user.service';
import {User} from '../../../shared/_models/User';
import {first} from 'rxjs/internal/operators';
import {Router} from '@angular/router';
import {NgRedux, select} from '@angular-redux/store';
import {IAppState} from '../../../shared/store/model';
import {SIGNED_UP} from '../../../shared/store/actions';

@Component({
  selector: 'app-feature-authentication-register',
  templateUrl: 'register.component.html'
})
export class FeatureAuthenticationRegisterComponent {
  constructor( ) { }
}
