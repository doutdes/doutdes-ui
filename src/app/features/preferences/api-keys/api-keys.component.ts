import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiKeysService} from '../../../shared/_services/apikeys.service';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiKey, Service} from '../../../shared/_models/ApiKeys';
import {D_TYPE, DS_TYPE} from '../../../shared/_models/Dashboard';
import {FacebookService} from '../../../shared/_services/facebook.service';
import {GoogleAnalyticsService} from '../../../shared/_services/googleAnalytics.service';

@Component({
  selector: 'app-feature-preferences-api-keys',
  templateUrl: './api-keys.component.html'
})

export class FeaturePreferencesApiKeysComponent implements OnInit, OnDestroy {

  apiKeysList$: ApiKey[] = null;
  tokenToSave: string;
  services$: Service[] = [];

  constructor(
    private apiKeyService: ApiKeysService,
    private fbService: FacebookService,
    private gaService: GoogleAnalyticsService,
    private breadcrumbActions: BreadcrumbActions,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  async ngOnInit() {
    this.addBreadcrumb();
    // this.apiKeysList$ = await this.apiKeyService.getAllKeys().toPromise();
    await this.formatServices();

    // console.log(this.services);

    this.route.paramMap.subscribe(params => { // TODO change for error messages on login with services
      this.tokenToSave = params.get('token');

      console.log(this.tokenToSave);

      if (this.tokenToSave) {

        let apiKey: ApiKey = {
          user_id: null,
          api_key: this.tokenToSave,
          service_id: 0
        };

        this.apiKeyService.registerKey(apiKey).subscribe(data => {
          this.router.navigate(['/preferences/api-keys/'], {queryParams: {token: null}, queryParamsHandling: 'merge'});
        }, error => {
          console.error(error);
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }

  async updateList() {
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

  async formatServices(){
    for(const SERVICE in D_TYPE) {
      let scopes = [], name;

      scopes = (await this.apiKeyService.isPermissionGranted(D_TYPE[SERVICE]).toPromise())['scopes'];
      name = DS_TYPE[D_TYPE[SERVICE]] + '';

      console.log(D_TYPE[SERVICE]);

      if(scopes && SERVICE == 'YT' || SERVICE == 'GA') {
        scopes = scopes.map(el => el.substr(el.lastIndexOf('/') + 1));
      }

      this.services$.push({
        name: name,
        type: D_TYPE[SERVICE],
        permissions: scopes + ''
      })
    }
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
        // this.updateList();
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
