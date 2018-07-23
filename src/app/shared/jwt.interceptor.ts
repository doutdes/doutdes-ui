import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {StoreService} from './_services/store.service';
import {first, map, take} from 'rxjs/internal/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private localStorage: StoreService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available

/*    this.localStorage.getToken().pipe(
      map(tkn => {
        console.log(tkn);

        if (tkn !== null) {

          const headers = request.headers
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${tkn}`);

          const cloneReq = request.clone({ headers });

          console.log(cloneReq);

          return next.handle(cloneReq);
        }

        // return next.handle(request);
      }), first());

    return next.handle(request);*/


    const tkn = this.localStorage.getToken();

    if (tkn !== null) {
      const headers = request.headers
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${tkn}`);

      const cloneReq = request.clone({ headers });

      console.log(cloneReq);

      return next.handle(cloneReq);
    }

    return next.handle(request);

  }
}
