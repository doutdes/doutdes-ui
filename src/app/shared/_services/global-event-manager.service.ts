import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DashboardCharts} from '../_models/DashboardCharts';

@Injectable()
export class GlobalEventsManagerService {

  private subscribers: Array<Number> = [];

  public isSubscriber(dash_type) {

    if (this.subscribers && this.subscribers.length > 0 && this.subscribers.find(el => el === dash_type)) {
      return true;
    }
    return false;
  }

  public addSubscriber(dash_type) {

    if (this.subscribers && !this.subscribers.find(el => el === dash_type)) {
      this.subscribers.push(dash_type);
      return true;
    }
    return false;
  }

  public getSubscribers() {
    console.log('Subscribers:');
    console.log(this.subscribers);
  }

  public isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public removeFromDashboard: BehaviorSubject<[number, number]> = new BehaviorSubject<[number, number]>([0, 0]);
  public updateChartInDashboard: BehaviorSubject<DashboardCharts> = new BehaviorSubject<DashboardCharts>(null);
  public showChartInDashboard: BehaviorSubject<DashboardCharts> = new BehaviorSubject<DashboardCharts>(null);
  public updateChartList: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingScreen: BehaviorSubject<boolean> = new BehaviorSubject(false);
}
