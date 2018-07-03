import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {first} from 'rxjs/internal/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../../authentication.service';


@Component({
  selector: 'app-feature-authentication-login-form',
  templateUrl: './login-form.component.html'
})
export class FeatureAuthenticationLoginFormComponent implements OnInit {

  loginForm: FormGroup;
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

    this.authenticationService.logout();

    this.returnUrl = '';
  }


  get f() { return this.loginForm.controls; }

  onSubmit () {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authenticationService.login(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe(data => {
        if (data) {
          console.log('Navigo in home page');
          this.router.navigateByUrl(this.returnUrl);
        }
      }, error => {

        if (!error['logged']) {
          this.failed = true;
        }

        this.loading = false;
      });
  }

}
