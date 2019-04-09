import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {StoreService} from '../../../../shared/_services/store.service';
import {ApiKeysService} from '../../../../shared/_services/apikeys.service';
import {Router} from '@angular/router';
import {BreadcrumbActions} from '../../../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../../../core/breadcrumb/Breadcrumb';
import {FacebookService} from '../../../../shared/_services/facebook.service';
import {environment} from '../../../../../environments/environment';
import {D_TYPE, DS_TYPE} from '../../../../shared/_models/Dashboard';
import {Service} from '../../../../shared/_models/ApiKeys';
import {GlobalEventsManagerService} from '../../../../shared/_services/global-event-manager.service';
import {forkJoin} from 'rxjs';
import {ngxLoadingAnimationTypes} from 'ngx-loading';

const PrimaryWhite = '#ffffff';

@Component({
  selector: 'app-feature-preferences-apikeys-register-form',
  templateUrl: './register-form.component.html'
})

export class FeaturePreferencesApiKeysRegisterFormComponent implements OnInit, OnDestroy {

  services$ = {};
  D_TYPE = D_TYPE;

  private envURL = environment.protocol + environment.host + ':' + environment.port;

  fbLoginURL: string;
  igLoginURL: string;
  gaLoginURL: string;
  ytLoginURL: string;

  loading;
  allGranted = true;

  public config = {
    animationType: ngxLoadingAnimationTypes.threeBounce,
    backdropBackgroundColour: 'rgba(0,0,0,0.1)',
    backdropBorderRadius: '4px',
    primaryColour: PrimaryWhite,
    secondaryColour: PrimaryWhite
  };

  constructor(
    private formBuilder: FormBuilder,
    private store: StoreService,
    private apiKeyService: ApiKeysService,
    private fbService: FacebookService,
    private router: Router,
    private breadcrumbActions: BreadcrumbActions,
    private geManager: GlobalEventsManagerService
  ) {
    this.loading = this.geManager.loadingScreen.asObservable();
  }

  async ngOnInit() {
    this.addBreadcrumb();
    this.geManager.loadingScreen.next(true);
    await this.updateList();
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
      for(const i in services) {
        this.services$[services[i].type] = services[i];
        this.allGranted = this.allGranted && services[i].granted;
      }
      this.geManager.loadingScreen.next(false);
      this.setURL();
    });
  }

  setURL() {
    this.fbLoginURL = this.envURL + '/fb/login?user_id=' + this.store.getId();
    this.igLoginURL = this.envURL + '/ig/login?user_id=' + this.store.getId();
    this.gaLoginURL = this.envURL + (this.services$[D_TYPE.YT] && this.services$[D_TYPE.YT].granted ? '/ga/yt' : '/ga') + '/login?user_id=' + this.store.getId();
    this.ytLoginURL = this.envURL + (this.services$[D_TYPE.GA] && this.services$[D_TYPE.GA].granted ? '/ga/yt' : '/yt') + '/login?user_id=' + this.store.getId();
  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Preferenze', '/preferences/'));
    bread.push(new Breadcrumb('Sorgenti dati', '/preferences/api-keys/'));
    bread.push(new Breadcrumb('Inserisci', '/preferences/api-keys/insert'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }
}



