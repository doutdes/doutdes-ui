import {Injectable, NgModuleRef} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {NgRedux, select} from '@angular-redux/store';
import {AuthenticationService} from '../../features/authentication/authentication.service';
import {map, take} from 'rxjs/internal/operators';
import {IAppState} from '../store/model';
import {StoreService} from '../_services/store.service';
import {GlobalEventsManagerService} from '../_services/global-event-manager.service';

@Injectable()

export class IsAuthenticatedGuard implements CanActivate {
  @select('login') loginState;

  constructor(private router: Router, private localStore: StoreService, private eventEmitter: GlobalEventsManagerService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

      // Select the login item from the store
      return this.localStore.getToken().pipe(
        map(tkn => {

          // If the token exists, then the user is logged in and can carry on
          if (tkn != null) {

            this.eventEmitter.showNavBar.emit(true);
            this.eventEmitter.userLogged.emit(true);
            return true;
          }

          // If the user is not logged in, he is redirect to the login view
          this.eventEmitter.showNavBar.emit(false);
          this.eventEmitter.userLogged.emit(false);

          this.router.navigate(['authentication/login']);
          return false;

        }), take(1)
      );
    }
}
