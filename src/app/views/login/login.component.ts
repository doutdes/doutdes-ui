import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../../_services/authentication.service';
import {first} from 'rxjs/internal/operators';
import {NgRedux, select} from '@angular-redux/store';
import {LOGGED} from '../../store/actions';
import {IAppState} from '../../store/model';
import {AlertConfig} from 'ngx-bootstrap/alert';

export function getAlertConfig(): AlertConfig {
  return Object.assign(new AlertConfig(), { type: 'success' });
}

@Component({
  selector: 'app-dashboard',
  templateUrl: 'login.component.html',
  providers: [{ provide: AlertConfig, useFactory: getAlertConfig }]
})
export class LoginComponent implements OnInit {

  @select() username;
  @select() just_signed;
  @select() logged;

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
    private ngRedux: NgRedux<IAppState>
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.authenticationService.logout();

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
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
        this.onLogged(this.f.username.value, data.token);
        this.router.navigate([this.returnUrl]);
      }, error => {

        if (!error['logged']) {
          this.failed = true;
        }

        this.loading = false;
      });
  }

  onLogged(username: string, token: string){
    this.ngRedux.dispatch({type: LOGGED, username: username, jwt: token});
  }
}
