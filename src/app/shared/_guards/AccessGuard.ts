import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {select} from '@angular-redux/store';

@Injectable()

export class AccessGuard implements CanActivate {
  @select() username;

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean>|Promise<boolean>|boolean {
    const requiresLogin = route.data.requiresLogin || false;

    if (requiresLogin && this.username.length > 0) {
      console.log(this.username);
      return true;
    }

    this.router.navigate(['/authentication/login']);
    return false;
  }
}
