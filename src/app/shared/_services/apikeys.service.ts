import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiKey} from '../_models/ApiKeys';
import {environment} from '../../../environments/environment';
import {AuthService, FacebookLoginProvider, SocialUser} from 'angularx-social-login';
import {GoogleLoginProvider} from 'angularx-social-login';

@Injectable()
export class ApiKeysService {

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  registerKey(api: ApiKey) {
    return this.http.post('http://' + environment.host + ':' + environment.port + '/keys/insert', api);
  }

  getAllKeys() {
    return this.http.get<ApiKey[]>('http://' + environment.host + ':' + environment.port + '/keys/getAll/');
  }

  deleteKey(service) {
    return this.http.request('delete', 'http://' + environment.host + ':' + environment.port + '/keys/delete',
      {body: {service_id: service}});
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  signOut(): void {
    this.authService.signOut();
  }

}
