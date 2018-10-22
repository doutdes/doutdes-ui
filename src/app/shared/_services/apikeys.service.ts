import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiKey} from '../_models/ApiKeys';
import {environment} from '../../../environments/environment';

@Injectable()
export class ApiKeysService {

  constructor(private http: HttpClient) {
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

}
