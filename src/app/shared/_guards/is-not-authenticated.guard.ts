import {Injectable, NgModuleRef} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {NgRedux, select} from '@angular-redux/store';
import {AuthenticationService} from '../../features/authentication/authentication.service';
import {map, take} from 'rxjs/internal/operators';
import {IAppState} from '../store/model';

@Injectable()

export class IsAuthenticatedGuard implements CanActivate {
  @select('login') loginState;

  constructor(private router: Router, private authService: AuthenticationService, private store: NgRedux<IAppState>) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    const requiresLogin = route.data.requiresLogin || false;

    // Select the login item from the store
    return this.store.select('login').pipe(
      map(logState => {
          // If the token is stored, the user is logged and can access to the page
          console.log(logState);

          if (logState['token'] == null) {
            return true;
          }

          this.router.navigate(['authentication/login']);
          return false;
        }
      ), take(1)
    );
  }
}
