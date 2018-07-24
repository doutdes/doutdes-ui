///<reference path="../../../../../node_modules/@angular/core/src/metadata/lifecycle_hooks.d.ts"/>
import {Component, OnInit} from '@angular/core';
import {ApiKeysService} from '../../../shared/_services/apikeys.service';

@Component({
  selector: 'app-feature-preferences-api-keys',
  templateUrl: './api-keys.component.html'
})

export class FeaturePreferencesApiKeysComponent implements OnInit {

  apiKeysList$: Array<any> = [];

  constructor(private apiKeyService: ApiKeysService) {
  }

  ngOnInit(): void {
    this.updateList();
  }

  updateList(): void {
    this.apiKeyService.getAllKeys()
      .pipe()
      .subscribe(data => {
        this.apiKeysList$ = data;
      }, error => {
        console.log(error);
      });
  }

  serviceName(id): string {
    switch (id) {
      case 0:
        return 'Facebook Pages';
      case 1:
        return 'Google Analytics';
    }
  }

  deleteService(service): void {
    this.apiKeyService.deleteKey(service)
      .pipe()
      .subscribe(data => {
        this.updateList();
      }, error => {
        console.log(error);
      });
  }

}
