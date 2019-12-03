import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {StoreService} from './store.service';
import {environment} from '../../../environments/environment';
import {DashboardCharts} from '../_models/DashboardCharts';
import {Chart} from '../_models/Chart';
import {Dashboard} from '../_models/Dashboard';
import {catchError, timeout} from 'rxjs/operators';
import {Observable, of} from 'rxjs';

@Injectable()

export class DashboardService {
  private readonly baseUrl = `${environment.protocol}${environment.host}:${environment.port}/dashboards`;
  private readonly headers: HttpHeaders;

  constructor(
    private http: HttpClient,
    private storeService: StoreService
  ) {
    this.headers = new HttpHeaders()
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${this.storeService.getToken()}`);
  }

  getDashboardByType = (type) =>
    this.http.get<Dashboard>(`${this.baseUrl}/getDashboardByType/${type}`, {headers: this.headers});

  getChartsByFormat = (format: string): Observable<Array<Chart>> =>
    this.http.get<Array<Chart>>(`${this.baseUrl}/getChartsByFormat/${format}`, {headers: this.headers});

  getAllDashboardCharts = (dashboard_id) =>
    this.http.get<DashboardCharts[]>(`${this.baseUrl}/getDashboardByID/${dashboard_id}`, {headers: this.headers});

  getDashboardChart = (dashboard_id, chart_id) =>
    this.http.get<DashboardCharts[]>(`${this.baseUrl}/getChart/${dashboard_id}/${chart_id}`, {headers: this.headers});

  getChartsNotAddedByDashboardType = (dashboard_id, dashboard_type) =>
    this.http.get<Chart[]>(
      `${this.baseUrl}/getChartsNotAddedByDashboardAndType/${dashboard_id}${dashboard_type ? '/' + dashboard_type : ''}`,
      {headers: this.headers}
    );

  getChartsNotAdded = (dashboard_id) =>
    this.http.get<Chart[]>(`${this.baseUrl}/getChartsNotAddedByDashboard/${dashboard_id}`, {headers: this.headers});


  addChartToDashboard = (chart) =>
    this.http.post(`${this.baseUrl}/addChartToDashboard/`, {chart}, {headers: this.headers});

  updateChart = (chart) =>
    this.http.put(`${this.baseUrl}/updateChartInDashboard/`, {chart}, {headers: this.headers});


  updateChartPosition = (chartArray) =>
    this.http.put(`${this.baseUrl}/updateChartsInDashboard/`, {chartArray}, {headers: this.headers});

  removeChart = (dashboard_id, chart_id) =>
    this.http.request('delete', `${this.baseUrl}/removeChartFromDashboard`, {
      headers: this.headers,
      body: {
        dashboard_id: dashboard_id,
        chart_id: chart_id
      }
    });

  clearDashboard = (dashboard_id) =>
    this.http.request('delete', `${this.baseUrl}/clearDashboard/`, {
      body: {
        dashboard_id: dashboard_id
      },
      headers: this.headers
    });

  addDashboard = (dashboard_name, dashboard_category) =>
    this.http.post(`${this.baseUrl}/addDashboard/`, {
        body: {
          dashboard_name: dashboard_name,
          dashboard_category: dashboard_category
        }
      },
      {headers: this.headers}
    );

  deleteDashboard = (dashboard_id) =>
    this.http.request('delete', `${this.baseUrl}/deleteDashboard`, {
      headers: this.headers,
      body: {
        dashboard_id: dashboard_id
      }
    });

  addUserDashboard = (dashboard_id) =>
    this.http.post(`${this.baseUrl}/addUserDashboard/`, {
      body: {
        dashboard_id: dashboard_id
      }
    }, {
      headers: this.headers
    });

  deleteUserDashboard = (dashboard_id) =>
    this.http.request('delete', environment.protocol + environment.host + ':' + environment.port + '/dashboards/deleteUserDashboard', {
      headers: this.headers,
      body: {
        dashboard_id: dashboard_id
      }
    });
}
