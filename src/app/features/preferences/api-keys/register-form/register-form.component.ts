import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {StoreService} from '../../../../shared/_services/store.service';
import {ApiKeysService} from '../../../../shared/_services/apikeys.service';
import {Router} from '@angular/router';
import {BreadcrumbActions} from '../../../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../../../core/breadcrumb/Breadcrumb';

@Component({
  selector: 'app-feature-preferences-apikeys-register-form',
  templateUrl: './register-form.component.html'
})

export class FeaturePreferencesApiKeysRegisterFormComponent implements OnInit, OnDestroy {

  registrationForm: FormGroup;
  selectedService = 0;
  loading = false;
  submitted = false;
  error400 = false;

  constructor(private formBuilder: FormBuilder,
              private store: StoreService,
              private apiKeysService: ApiKeysService,
              private router: Router,
              private breadcrumbActions: BreadcrumbActions,
  ){
  }

  ngOnInit(): void {
    this.registrationForm = this.formBuilder.group({
      api_key: ['', Validators.compose([Validators.maxLength(200)])],
    });
    this.addBreadcrumb();
  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }

  onFileChange(event) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsText(file);

      reader.onload = () => {
        const results = JSON.parse(reader.result);

        this.registrationForm.value.client_email = results['client_email'];
        this.registrationForm.value.private_key = results['private_key'];
      };
    }
  }

  get f() {
    return this.registrationForm.controls;
  }

  selectChangeHandler(event: any) {

    this.selectedService = event.target.value;
    this.registrationForm.value.service_id = event.target.value;
  }

  onSubmit() {
    this.submitted = true;

    if (this.registrationForm.invalid) {
      this.loading = false;
      return;
    }

    this.registrationForm.value.user_id = this.store.getId();
    this.registrationForm.value.service_id = this.selectedService;

    this.apiKeysService.registerKey(this.registrationForm.value)
      .pipe()
      .subscribe(data => {
        this.router.navigate(['/preferences/api-keys']);
      }, error => {
        this.loading = false;
        if (error.status === 400) {
          this.error400 = true;
        }
        console.log(error);
      });
  }

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Preferences', '/preferences/'));
    bread.push(new Breadcrumb('Api Keys', '/preferences/api-keys/'));
    bread.push(new Breadcrumb('Insert', '/preferences/api-keys/insert'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }
  signInWithFB() {
    this.apiKeysService.signInWithFB();
  }

}



