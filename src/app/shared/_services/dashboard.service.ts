import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {StoreService} from './store.service';
import {environment} from '../../../environments/environment';
import {DashboardCharts} from '../_models/DashboardCharts';
import {Chart} from '../_models/Chart';

@Injectable()

export class DashboardService {
  constructor(
    private http: HttpClient,
    private storeService: StoreService
  ) {
  }

  getDashboardByType(type) {
    const headers = this.getAuthorization();
    return this.http.get<DashboardCharts[]>('http://' + environment.host + ':' + environment.port + '/dashboards/getDashboardChartsByType/'
      + type, {headers});
  }

  getChartInDashboard(dashboard_id, chart_id) {
    const headers = this.getAuthorization();
    return this.http.get<DashboardCharts[]>('http://' + environment.host + ':' + environment.port + '/dashboards/getChart/'
      + dashboard_id + '/' + chart_id, {headers});
  }

  getChartsNotAddedByDashboardType(dashboard_id, dashboard_type) {
    const headers = this.getAuthorization();
    return this.http.get<Chart[]>('http://' + environment.host + ':' + environment.port + '/dashboards/getChartsNotAddedByDashboardAndType/'
      + dashboard_id + '/' + dashboard_type, {headers});
  }

  getChartsNotAdded(dashboard_id) {
    const headers = this.getAuthorization();
    return this.http.get<Chart[]>('http://' + environment.host + ':' + environment.port + '/dashboards/getChartsNotAddedByDashboard/'
      + dashboard_id, {headers});
  }

  addChartToDashboard(chart) {
    const headers = this.getAuthorization();
    return this.http.post('http://' + environment.host + ':' + environment.port + '/dashboards/addChartToDashboard/', {chart}, {headers});
  }

  updateChart(chart)  {
    const headers = this.getAuthorization();
    return this.http.put('http://' + environment.host + ':' + environment.port + '/dashboards/updateChartInDashboard/', {chart}, {headers});
  }

  removeChart(dashboard_id, chart_id) {

    const headers = this.getAuthorization();

    const body = {
      dashboard_id: dashboard_id,
      chart_id: chart_id
    };

    return this.http.request('delete', 'http://' + environment.host + ':' + environment.port + '/dashboards/removeChartFromDashboard', {
      headers,
      body
    });
  }

  getAuthorization() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }
}
