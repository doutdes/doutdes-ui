import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DashboardCharts} from '../_models/DashboardCharts';

@Injectable()
export class GlobalEventsManagerService {
  public isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public removeFromDashboard: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public updateChartInDashboard: BehaviorSubject<DashboardCharts> = new BehaviorSubject<DashboardCharts>(null);
  public addChartInDashboard: BehaviorSubject<DashboardCharts> = new BehaviorSubject<DashboardCharts>(null);
  public updateChartList: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingScreen: BehaviorSubject<boolean> = new BehaviorSubject(false);
}
