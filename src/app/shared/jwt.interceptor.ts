import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {StoreService} from './_services/store.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private localStorage: StoreService, private httpClient: HttpClient) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available

    const tkn = this.localStorage.getToken();

    if (tkn !== null) {
      const headers = request.headers
        .set('Content-type', 'application/json')
        .set('Authorization', `Bearer ${tkn}`);

      const cloneReq = request.clone({ headers });

      // console.log('jwt interceptor ts:');
      // console.log(cloneReq);

      return next.handle(cloneReq);
    }

    return next.handle(request);

  }
}
