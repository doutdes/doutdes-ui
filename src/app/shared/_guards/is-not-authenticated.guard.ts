import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {select} from '@angular-redux/store';
import {AuthenticationService} from '../../features/authentication/authentication.service';
import {StoreService} from '../_services/store.service';

@Injectable()

export class IsNotAuthenticatedGuard implements CanActivate {
  @select('login') loginState;

  constructor(private router: Router, private authService: AuthenticationService, private localStore: StoreService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

    if(!this.localStore.getToken()) {
      // The user is not logged in
      return true;
    }

    this.router.navigate(['']);
    return false;
  }
}
