import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import {select} from '@angular-redux/store';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  @select() jwt;
  @select() username;

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    if (this.username && this.jwt) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.jwt}`
        }
      });
    }

    return next.handle(request);
  }
}
