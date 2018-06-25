import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { faUserTie } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-dashboard',
  templateUrl: 'register.component.html'
})
export class RegisterComponent implements OnInit{

  registrationForm: FormGroup;
  selectedUser: 'company';
  loading = false;

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.registrationForm = this.formBuilder.group({
      first_name:  ['', Validators.required],
      last_name:   ['', Validators.required],
      birth_place: ['', Validators.required],
      birth_date:  ['', Validators.required],
      username:    ['', Validators.required],
      email:       ['', Validators.required],
      password:    ['', Validators.required],
      r_password:  ['', Validators.required]
    });
  }

  get f() { return this.registrationForm.controls; }

  selectChangeHandler (event: any) {
    this.selectedUser = event.target.value;
  }

  onSubmit() {
    if (this.registrationForm.invalid) {
      return;
    }

    this.loading = true;
  }

}
