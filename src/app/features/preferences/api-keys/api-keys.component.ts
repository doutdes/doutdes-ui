import {Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {ApiKeysService} from '../../../shared/_services/apikeys.service';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiKey, Service} from '../../../shared/_models/ApiKeys';
import {D_TYPE, DS_TYPE} from '../../../shared/_models/Dashboard';
import {FacebookService} from '../../../shared/_services/facebook.service';
import {GoogleAnalyticsService} from '../../../shared/_services/googleAnalytics.service';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';

@Component({
  selector: 'app-feature-preferences-api-keys',
  templateUrl: './api-keys.component.html'
})

export class FeaturePreferencesApiKeysComponent implements OnInit, OnDestroy {

  tokenToSave: string;
  services$: Service[] = [];
  modalRef: BsModalRef;
  serviceToDelete: Service;

  constructor(
    private apiKeyService: ApiKeysService,
    private fbService: FacebookService,
    private gaService: GoogleAnalyticsService,
    private breadcrumbActions: BreadcrumbActions,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: BsModalService
  ) {
  }

  async ngOnInit() {
    this.addBreadcrumb();
    await this.updateList();

    this.route.paramMap.subscribe(params => { // TODO change for error messages on login with services
      this.tokenToSave = params.get('token');

      // console.log(this.tokenToSave);

      if (this.tokenToSave) {

        let apiKey: ApiKey = {
          user_id: null,
          api_key: this.tokenToSave,
          service_id: 0
        };

        this.apiKeyService.registerKey(apiKey).subscribe(data => {
          this.router.navigate(['/preferences/api-keys/'], {queryParams: {token: null}, queryParamsHandling: 'merge'});
        }, err => {
          console.error(err);
        });
      }
    });
  }

  async updateList(){ // TODO edit with forkJoin and loading button
    this.services$ = [];

    for(const SERVICE in D_TYPE) { // For each service key (FB, GA, ecc) in D_TYPE
      let scopes = (await this.apiKeyService.isPermissionGranted(D_TYPE[SERVICE]).toPromise()).scopes; // Check the permissions granted

      if (scopes) {
        if (SERVICE == 'YT' || SERVICE == 'GA') {
          scopes = scopes.map(el => el.substr(el.lastIndexOf('/') + 1));//.replace(/\./g, ' '));
        }

        scopes = scopes.map(el => el.replace(/[^\w\s]|_/g, ' '));

        this.services$.push({
          name: DS_TYPE[D_TYPE[SERVICE]] + '',
          type: D_TYPE[SERVICE],
          scopes: scopes
        });
      }
    }
  }

  openModal(template: TemplateRef<any>, service: Service) {
    this.serviceToDelete = service;
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered'});
  }

  async deleteService(service) {
    this.apiKeyService.deleteKey(service)
      .pipe()
      .subscribe(async () => {
        await this.updateList();
      }, err => {
        console.error(err);
      });
  }

  getLogo(serviceID: number) {
    let classes = 'mr-2 mt-1 fab ';

    switch (serviceID) {
      case D_TYPE.FB:
        classes += 'fa-facebook-square fb-color';
        break;
      case D_TYPE.GA:
        classes += 'fa-google ga-color';
        break;
      case D_TYPE.IG:
        classes += 'fa-instagram ig-color';
        break;
      case D_TYPE.YT:
        classes += 'fa-youtube yt-color';
        break;
    }

    return classes;
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

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }
}
