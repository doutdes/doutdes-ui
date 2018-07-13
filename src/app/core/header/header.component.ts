///<reference path="../../../../node_modules/rxjs/internal/operators/first.d.ts"/>
import {Component, OnInit} from '@angular/core';
import {select} from '@angular-redux/store';
import {Observable} from 'rxjs';
import {LoginState} from '../../features/authentication/login/login.model';
import {User} from '../../shared/_models/User';
import {LoginActions} from '../../features/authentication/login/login.actions';
import {StoreService} from '../../shared/_services/store.service';
import {AuthenticationService} from '../../features/authentication/authentication.service';
import {first, map} from 'rxjs/internal/operators';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';

@Component({
  selector: 'app-core-header',
  templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit {

  username$: string = null;
  logged$ = false;

  constructor(
    private actions: LoginActions,
    private localStore: StoreService,
    private authService: AuthenticationService,
    private globalEventService: GlobalEventsManagerService
  ) {
    this.isUserLogged();
    this.updateUsername();
  }

  ngOnInit(): void {
    this.isUserLogged();
  }

  logout() {
    this.actions.logoutUser();
    this.authService.logout();
  }

  updateUsername() {
    this.localStore.getUsername().subscribe(name => {
      this.username$ = name;
    });
  }

  isUserLogged() {
    this.globalEventService.userLogged.subscribe((mode: boolean) => {
      this.logged$ = mode;
    });
  }

}
