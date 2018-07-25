import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiKey} from '../_models/ApiKeys';

@Injectable()
export class ApiKeysService {

  constructor(private http: HttpClient) {
  }

  registerKey(api: ApiKey) {
    return this.http.post('http://www.doutdes-cluster.it:443/keys/insert', api);
  }

  getAllKeys() {
    return this.http.get<ApiKey[]>('http://www.doutdes-cluster.it:443/keys/getAll/');
  }

  deleteKey(service) {
    // let key: ApiKey;
    // key.service = service;
    return this.http.request('delete', 'http://www.doutdes-cluster.it:443/keys/delete', {body: {service: service}});
  }

}
