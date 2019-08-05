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
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../../shared/_services/user.service';
import {User} from '../../../shared/_models/User';

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

  checkbox: Boolean;

  lang: any;
  value: string;
  tmp: string;
  user: User;

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
    private toastr: ToastrService,
    public translate: TranslateService,
    private userService: UserService
  ) {
    this.loading = this.geManager.loadingScreen.asObservable();

    this.translate.addLangs(['Italiano', 'English']);

  }

  async ngOnInit() {
    const error = this.route.snapshot.queryParamMap.get('err');

    this.addBreadcrumb();
    this.geManager.loadingScreen.next(true);
    await this.updateList();

    if(error == 'true') {
      //this.toastr.error('Si è verificato un errore durante l\'accesso ai dati. Per favore, riprova oppure contatta il supporto.','Errore durante l\'accesso ai dati!');

      this.toastr.error(this.geManager.getStringToastr(false, true, "PREFERENCES", 'NO_ACCESSO'),
        this.geManager.getStringToastr(true, false, 'PREFERENCES', 'NO_ACCESSO'));
      this.router.navigate([], { replaceUrl: true});
    }
    if(error != null && error == 'false') {
      //this.toastr.success('La configurazione del servizio scelto è andata a buon fine.','Servizio configurato correttamente!');
      this.toastr.success(this.geManager.getStringToastr(false, true, "PREFERENCES", 'NO_ACCESSO'),
        this.geManager.getStringToastr(true, false, 'PREFERENCES', 'NO_ACCESSO'));

      this.router.navigate([], { replaceUrl: true});
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
    this.checkbox = false;
    this.serviceToDelete = service;
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered'});
  }

  async deleteService(serviceType: number) {
    this.apiKeyService.revokePermissions(serviceType).subscribe(async response => {
      this.filterActions.removedStoredDashboard(serviceType);
      delete this.services$[serviceType];

      if(serviceType === D_TYPE.FB && Object.keys(this.services$).includes(D_TYPE.IG+  '')) {
        delete this.services$[D_TYPE.IG];
        /*
        this.toastr.info(
          'Da adesso non potrai più accedere alle dashboard collegate a ' + DS_TYPE[D_TYPE.IG],
          'Sorgente ' + DS_TYPE[D_TYPE.IG] + ' eliminata'
        );
         */

        this.toastr.info( this.geManager.getStringToastr(false, true, "PREFERENCES" , 'STOP_ACCESSO') + DS_TYPE[D_TYPE.IG],
          DS_TYPE[D_TYPE.IG] + this.geManager.getStringToastr(true, false, 'PREFERENCES', 'STOP_ACCESSO'));
      }

      if(Object.keys(this.services$).length === 0) this.somethingGranted = false;
      /*
      this.toastr.info(
        'Da adesso non potrai più accedere alle dashboard collegate a ' + DS_TYPE[serviceType],
        'Sorgente ' + DS_TYPE[serviceType] + ' eliminata'
      );
      */

      this.toastr.info(this.geManager.getStringToastr(false, true, "PREFERENCES", 'STOP_ACCESSO')  + DS_TYPE[serviceType],
         DS_TYPE[serviceType] + this.geManager.getStringToastr(true, false, 'PREFERENCES', 'STOP_ACCESSO'));

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

    this.userService.get().subscribe(data => {
      switch (data.lang) {
        case 'it':
          bread.push(new Breadcrumb('Preferenze', '/preferences/'));
          bread.push(new Breadcrumb('Sorgenti dati', '/preferences/api-keys/'));
          break;
        case 'en':
          bread.push(new Breadcrumb('Preferences', '/preferences/'));
          bread.push(new Breadcrumb('Data sources', '/preferences/api-keys/'));
          break;
        default:
          bread.push(new Breadcrumb('Preferenze', '/preferences/'));
          bread.push(new Breadcrumb('Sorgenti dati', '/preferences/api-keys/'));
          break;
      }
    });

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }

  check() {
    this.checkbox = !this.checkbox;
  }

}
