import {Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
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
import {ToastrService} from 'ngx-toastr';

const PrimaryWhite = '#ffffff';

@Component({
  selector: 'app-feature-preferences-api-keys',
  templateUrl: './api-keys.component.html'
})

export class FeaturePreferencesApiKeysComponent implements OnInit, OnDestroy {

  @ViewChild('oauthError') oauthError: ElementRef;

  D_TYPE = D_TYPE;

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
    private filterActions: FilterActions,
    private toastr: ToastrService
  ) {
    this.loading = this.geManager.loadingScreen.asObservable();
  }

  async ngOnInit() {
    const error = this.route.snapshot.queryParamMap.get('err');

    this.addBreadcrumb();
    this.geManager.loadingScreen.next(true);
    await this.updateList();

    if(error == 'true') {
      this.modalRef = this.modalService.show(this.oauthError, {class: 'modal-md modal-dialog-centered'});
      this.router.navigate([], { replaceUrl: true});
    }
    if(error != null && error == 'false') {
      this.toastr.success('La configurazione del servizio scelto è andata a buon fine.','Servizio configurato correttamente!')
    }
  }

  async updateList(){
    this.services$ = {};
    let observables = [];

    for(const SERVICE in D_TYPE) { // For each service key (FB, GA, ecc) in D_TYPE
      if(D_TYPE[SERVICE] !== D_TYPE.CUSTOM) {
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
      this.filterActions.removedStoredDashboard(serviceType);
      delete this.services$[serviceType];

      if(serviceType === D_TYPE.FB && Object.keys(this.services$).includes(D_TYPE.IG+  '')) {
        delete this.services$[D_TYPE.IG];
      }

      if(Object.keys(this.services$).length === 0) this.somethingGranted = false;

      this.toastr.info(
        'Da adesso non potrai più accedere alle dashboard collegate a ' + DS_TYPE[serviceType],
        'Sorgente ' + DS_TYPE[serviceType] + ' eliminata'
      );

    }, err => {
      console.error(err);
    });

    this.modalRef.hide();
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
    bread.push(new Breadcrumb('Preferenze', '/preferences/'));
    bread.push(new Breadcrumb('Sorgenti dati', '/preferences/api-keys/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }
}
