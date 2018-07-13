import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../../authentication.service';
import {NgRedux, select} from '@angular-redux/store';
import {IAppState} from '../../../../shared/store/model';
import {Credentials} from '../login.model';
import {Observable} from 'rxjs';
import {first} from 'rxjs/internal/operators';

@Component({
  selector: 'app-feature-authentication-login-form',
  templateUrl: './login-form.component.html'
})
export class FeatureAuthenticationLoginFormComponent implements OnInit {

  loginForm: FormGroup;
  credentials: Credentials;
  loading = false;
  submitted = false;
  returnUrl: string;
  failed = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.returnUrl = '';
  }

  get f() { return this.loginForm.controls; }

  onSubmit () {

    // If submitted, the validators start
    this.submitted = true;

    // If the form is invalid, don't go ahead
    if (this.loginForm.invalid) {
      return;
    }

    // At this point, all validators are true
    this.loading = true;

    // Save the credentials to pass to the authentication service
    this.credentials = {
      username: this.f.username.value,
      password: this.f.password.value
    };

    this.authenticationService.login(this.credentials)
      .pipe(first())
      .subscribe(data => {
        setTimeout(() => {
            this.router.navigate(['dashboard']);
          },
          10);
      }, error => {
        this.loading = false;
        this.failed = true;
      });

  }

}
