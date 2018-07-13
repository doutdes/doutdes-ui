import {Component, OnInit} from '@angular/core';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {AuthenticationService} from '../../features/authentication/authentication.service';
import {LoginActions} from '../../features/authentication/login/login.actions';
import {StoreService} from '../../shared/_services/store.service';

@Component({
  selector: 'app-core-breadcrumb',
  templateUrl: './breadcrumb.component.html',
})

export class BreadcrumbComponent implements OnInit {

  showBreadcrumb$ = false;

  constructor(
    private actions: LoginActions,
    private localStore: StoreService,
    private authService: AuthenticationService,
    private globalEventService: GlobalEventsManagerService
  ) {
    this.showNavbar();
  }

  ngOnInit(): void {
    this.showNavbar();
  }

  showNavbar() {
    this.globalEventService.showNavBar.subscribe((mode: boolean) => {
      this.showBreadcrumb$ = mode;
    });
  }

}
