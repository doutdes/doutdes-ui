import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiKeysService} from '../../../shared/_services/apikeys.service';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';


@Component({
  selector: 'app-feature-preferences-api-keys',
  templateUrl: './api-keys.component.html'
})

export class FeaturePreferencesApiKeysComponent implements OnInit, OnDestroy {

  apiKeysList$: any;

  constructor(private apiKeyService: ApiKeysService, private breadcrumbActions: BreadcrumbActions) {
  }

  ngOnInit(): void {
    this.addBreadcrumb();
    this.updateList();
  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }

  updateList(): void {
    this.apiKeyService.getAllKeys()
      .pipe()
      .subscribe(data => {
        if (data == null) {
          this.apiKeysList$ = null;
        } else {
          this.apiKeysList$ = data;
        }
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

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Preferences', '/preferences/'));
    bread.push(new Breadcrumb('Api Keys', '/preferences/api-keys/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

}
