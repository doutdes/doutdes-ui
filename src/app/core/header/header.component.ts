///<reference path="../../../../node_modules/rxjs/internal/operators/first.d.ts"/>
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {select} from '@angular-redux/store';
import {Observable} from 'rxjs';
import {LoginState} from '../../features/authentication/login/login.model';
import {User} from '../../shared/_models/User';
import {LoginActions} from '../../features/authentication/login/login.actions';
import {StoreService} from '../../shared/_services/store.service';
import {AuthenticationService} from '../../features/authentication/authentication.service';
import {first, map} from 'rxjs/internal/operators';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {UserService} from '../../shared/_services/user.service';
import {TranslateService} from '@ngx-translate/core';
import {ApiKeysService} from '../../shared/_services/apikeys.service';
import {FacebookMarketingService} from '../../shared/_services/facebook-marketing.service';

@Component({
  selector: 'app-core-header',
  templateUrl: './header.component.html'
})

export class HeaderComponent {

  isUserLoggedIn = false;
  showSidebar: boolean = false;
  username: string;
  today: string;

  lang: string;
  value: string;
  tmp: string;
  user: User;

  drag: boolean;

  fbm_flag = false;
  hide: boolean;

  constructor(
    private actions: LoginActions,
    private localStore: StoreService,
    private authService: AuthenticationService,
    public translate: TranslateService,
    private globalEventService: GlobalEventsManagerService,
    private userService: UserService,
    private apiKeyService: ApiKeysService,
    private FBMService: FacebookMarketingService,
  ) {
    this.today = new Date().toLocaleString();
    this.today = this.today.substr(0, this.today.length - 10); // I know this is evil, but i'm lazy
  }

  async ngOnInit() {
    if (!this.fbm_flag) { this.hide = true; }
    this.globalEventService.dragAndDrop.subscribe(value => this.drag = value);

    this.globalEventService.isUserLoggedIn.subscribe(value => {
      this.isUserLoggedIn = value;
      this.username = this.localStore.getUserNames();
    });

    if (this.isUserLoggedIn) {
      const pageID = (await this.apiKeyService.getAllKeys().toPromise());

      if (pageID && pageID.fbm_page_id) {
        this.fbm_flag = (await this.FBMService.getPages().toPromise()).length > 0;
    }

    if(! this.isUserLoggedIn) {
      this.translate.setDefaultLang('Italiano');
      }
    }

  }

  logout() {
    this.actions.logoutUser();
    this.authService.logout();
  }

  showMenu(show: boolean) {
    this.showSidebar = show;
  }

}
