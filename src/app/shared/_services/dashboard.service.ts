import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {StoreService} from './store.service';
import {FacebookFanCount} from '../_models/FacebookData';
import {environment} from '../../../environments/environment';
import {DashboardCharts} from '../_models/DashboardCharts';

@Injectable()

export class DashboardService {
  constructor(
    private http: HttpClient,
    private storeService: StoreService
  ) {
  }

  // TODO Format calls

  getDashboardByType(type) {
    const headers = this.getAuthorization();
    return this.http.get<DashboardCharts[]>('http://' + environment.host + ':' + environment.port + '/dashboards/getDashboardChartsByType/' + type, {headers});
  }

  getUserDashboards() {

  }

  getDashboardCharsByType() {

  }

  addChartToDashboard() {

  }

  getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
