import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Chart} from '../_models/Chart';
import {StoreService} from './store.service';

@Injectable()

export class ChartsService {

  chartsPath = '/charts/';

  constructor(
    private http: HttpClient,
    private storeService: StoreService
  ) {
  }

  getChartsByType(type) {
    const headers = this.getAuthorization();
    return this.http.get<Chart[]>('http://' + environment.host + ':' + environment.port + this.chartsPath + 'getByType/' + type, {headers});
  }

  getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
