import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {StoreService} from '../../../../shared/_services/store.service';
import {ApiKeysService} from '../../../../shared/_services/apikeys.service';

@Component({
  selector: 'app-feature-preferences-apikeys-register-form',
  templateUrl: './register-form.component.html'
})

export class FeaturePreferencesApiKeysRegisterFormComponent implements OnInit {

  registrationForm: FormGroup;
  selectedService = 0;
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private store: StoreService,
    private apiKeysService: ApiKeysService
  ) {
  }

  ngOnInit(): void {
    this.registrationForm = this.formBuilder.group({
      api_key: ['', Validators.compose([Validators.maxLength(100), Validators.required])]
    });
  }

  get f() {
    return this.registrationForm.controls;
  }

  selectChangeHandler(event: any) {
    this.selectedService = event.target.value;
  }

  onSubmit() {
    this.submitted = true;

    if (this.registrationForm.invalid) {
      this.loading = false;
      return;
    }

    this.registrationForm.value.service = this.selectedService;

    this.store.getId()
      .pipe()
      .subscribe(id => {
        this.registrationForm.value.user_id = id;

        this.apiKeysService.registerKey(this.registrationForm.value)
          .pipe()
          .subscribe(data => {
            // TODO routing sulla lista delle api key
          }, error => {
            this.loading = false;
            console.log('missing user_id');
          })
        ;
      }, error => {
        this.loading = false;
        console.log(error);
        console.log('registration failed');
      });

  }

}

