import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiKey} from '../_models/ApiKeys';

@Injectable()
export class ApiKeysService {

  constructor(private http: HttpClient) {
  }

  registerKey(api: ApiKey) {
    return this.http.post('http://localhost:3000/keys/insert', api);
  }

  getAllKeys() {
    return this.http.get<ApiKey[]>('http://localhost:3000/keys/getAll/');
  }

  deleteKey(service) {
    // let key: ApiKey;
    // key.service = service;
    return this.http.request('delete', 'http://localhost:3000/keys/delete', {body: {service: service}});
  }

}
