import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {Observable} from 'rxjs';

@Injectable()

export class AccessGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean>|Promise<boolean>|boolean {
    const requiresLogin = route.data.requiresLogin || false;

    if (requiresLogin && !localStorage.getItem('currentUser')) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
