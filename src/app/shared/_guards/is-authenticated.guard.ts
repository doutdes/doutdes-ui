import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {StoreService} from '../_services/store.service';
import {GlobalEventsManagerService} from '../_services/global-event-manager.service';

@Injectable()

export class IsAuthenticatedGuard implements CanActivate {
  constructor(private router: Router, private localStore: StoreService, private eventEmitter: GlobalEventsManagerService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

    // If the token exists, then the user is logged in and can carry on
    if (this.localStore.getToken() != null) {
      this.eventEmitter.isUserLoggedIn.next(true);
      return true;
    }

    // If the user is not logged in, he is redirect to the login view
    this.eventEmitter.isUserLoggedIn.next(false);
    this.router.navigate(['authentication/login']);

    return false;
  }
}
