import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PasswordValidation} from '../../_helpers/password-validator.directive';


@Component({
  selector: 'app-dashboard',
  templateUrl: 'register.component.html'
})
export class RegisterComponent implements OnInit{

  registrationForm: FormGroup;
  selectedUser = 'editor';
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.registrationForm = this.formBuilder.group({
      first_name:  ['', Validators.compose([Validators.maxLength(40), Validators.required])],
      last_name:   ['', Validators.compose([Validators.maxLength(40), Validators.required])],
      birth_place: ['', Validators.compose([Validators.maxLength(50), Validators.required])],
      birth_date:  ['', Validators.required],
      fiscal_code: ['', Validators.compose([Validators.maxLength(16), Validators.required])],
      address:     ['', Validators.compose([Validators.maxLength(100), Validators.required])],
      city:        ['', Validators.compose([Validators.maxLength(50), Validators.required])],
      zip_code:    ['', Validators.compose([Validators.maxLength(5), Validators.required])],
      province:    ['', Validators.compose([Validators.maxLength(2), Validators.required])],
      username:    ['', Validators.compose([Validators.maxLength(20), Validators.required])],
      email:       ['', Validators.required],
      password:    ['', Validators.compose([Validators.minLength(10), Validators.required])],
      r_password:  ['', Validators.compose([Validators.minLength(10), Validators.required])],
    }, {
      validator: PasswordValidation.MatchPassword
    });
  }

  get f() { return this.registrationForm.controls; }

  selectChangeHandler (event: any) {
    this.selectedUser = event.target.value;
  }

  onSubmit() {

    this.submitted = true;
    this.loading = true;

    if (this.registrationForm.invalid) {
      this.loading = false;
      return;
    }

    this.registrationForm.value.type = this.selectedUser;
    console.log(this.registrationForm.value); // TODO takes all the values from the form, I have to pass it to the model and to the service


  }
}
