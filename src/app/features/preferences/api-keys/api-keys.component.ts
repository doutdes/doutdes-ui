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
import {forkJoin, Observable} from 'rxjs';
import {GlobalEventsManagerService} from '../../../shared/_services/global-event-manager.service';
import {ngxLoadingAnimationTypes} from 'ngx-loading';
import {FilterActions} from '../../dashboard/redux-filter/filter.actions';

const PrimaryWhite = '#ffffff';

@Component({
  selector: 'app-feature-preferences-api-keys',
  templateUrl: './api-keys.component.html'
})

export class FeaturePreferencesApiKeysComponent implements OnInit, OnDestroy {

  D_TYPE = D_TYPE;

  tokenToSave: string;
  loading: Observable<boolean>;
  services$: {};
  modalRef: BsModalRef;
  serviceToDelete: Service;
  somethingGranted: boolean = false;

  public config = {
    animationType: ngxLoadingAnimationTypes.threeBounce,
    backdropBackgroundColour: 'rgba(0,0,0,0.1)',
    backdropBorderRadius: '4px',
    primaryColour: PrimaryWhite,
    secondaryColour: PrimaryWhite
  };

  constructor(
    private apiKeyService: ApiKeysService,
    private fbService: FacebookService,
    private gaService: GoogleAnalyticsService,
    private breadcrumbActions: BreadcrumbActions,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: BsModalService,
    private geManager: GlobalEventsManagerService,
    private filterActions: FilterActions
  ) {
    this.loading = this.geManager.loadingScreen.asObservable();
  }

  async ngOnInit() {
    this.addBreadcrumb();
    this.geManager.loadingScreen.next(true);
    await this.updateList();

    this.route.paramMap.subscribe(params => { // TODO change for error messages on login with services
      this.tokenToSave = params.get('token');

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

  async updateList(){
    this.services$ = {};
    let observables = [];

    for(const SERVICE in D_TYPE) { // For each service key (FB, GA, ecc) in D_TYPE // TODO D_TYPE[SERVICE] !== D_TYPE.YT when YouTube is ready
      if(D_TYPE[SERVICE] !== D_TYPE.CUSTOM && D_TYPE[SERVICE] !== D_TYPE.YT) {
        observables.push(this.apiKeyService.isPermissionGranted(D_TYPE[SERVICE]));
      }
    }

    forkJoin(observables).subscribe((services: Service[]) => {
      for (const i in services) {
        if (services[i].scopes) {
          if (services[i].type === D_TYPE.YT || services[i].type === D_TYPE.GA) {
            services[i].scopes = services[i].scopes.map(el => el.substr(el.lastIndexOf('/') + 1));
          }

          services[i].scopes = services[i].scopes.map(el => el.replace(/[^\w\s]|_/g, ' '));
          this.services$[services[i].type] = services[i];
        }

        this.geManager.loadingScreen.next(false);
        this.somethingGranted = this.somethingGranted || services[i].granted;
      }
    });
  }

  openModal(template: TemplateRef<any>, service: Service) {
    this.serviceToDelete = service;
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered'});
  }

  async deleteService(serviceType: number) {
    this.apiKeyService.revokePermissions(serviceType).subscribe(async response => {
      // If the service is one between FB and IG and there are no service authorized left, the key is been deleted from the database
      if (((serviceType === D_TYPE.FB || serviceType === D_TYPE.IG) &&
          !(this.services$[D_TYPE.FB] && this.services$[D_TYPE.FB].granted && this.services$[D_TYPE.IG] && this.services$[D_TYPE.IG].granted))
      ) {
        this.apiKeyService.deleteKey(serviceType).subscribe(() => {}, err => console.error(err));
      }

      this.filterActions.removedStoredDashboard(serviceType);
      delete this.services$[serviceType];
    }, err => {
      console.error(err);
    });

    // await this.updateList();
    this.modalRef.hide();
  }

  // async deleteKey(serviceType: number){
  //   this.apiKeyService.deleteKey(serviceType).subscribe(() => {}, err => console.error(err));
  // }

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
