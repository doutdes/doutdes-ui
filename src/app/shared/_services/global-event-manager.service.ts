import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class GlobalEventsManagerService {
  public isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public removeFromDashboard: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public updateChartInDashboard: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public addChartInDashboard: BehaviorSubject<number> = new BehaviorSubject<number>(0);
}
