import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ApiKey} from '../_models/ApiKeys';
import {environment} from '../../../environments/environment';
import {AuthService, FacebookLoginProvider, GoogleLoginProvider} from 'angularx-social-login';
import {StoreService} from './store.service';

@Injectable()
export class ApiKeysService {

  constructor(private http: HttpClient, private authService: AuthService, private storeService: StoreService) {
  }

  registerKey(api: ApiKey) {
    return this.http.post(this.formatUrl('insert'), api);
  }

  getAllKeys() {
    return this.http.get<ApiKey[]>(this.formatUrl('getAll'));
  }

  checkIfKeyExists(type: number) {
    const headers = this.getAuthorization();
    return this.http.get(this.formatUrl('checkIfExists/' + type), {headers});
  }

  deleteKey(service) {
    return this.http.request('delete', this.formatUrl('delete'),
      {body: {service_id: service}});
  }

  private formatUrl(call): string {
    return 'http://' + environment.host + ':' + environment.port + '/keys/' + call;
  }

  private getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }

}
