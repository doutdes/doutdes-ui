import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DashboardCharts} from '../_models/DashboardCharts';

@Injectable()
export class GlobalEventsManagerService {

  value: any;

  private subscribers: Array<Number> = [];

  public isSubscriber(dash_type) {
    if (this.subscribers && this.subscribers.length > 0 && this.subscribers.find(el => el == dash_type) !== undefined) {
      return true;
    }
    return false;
  }

  public addSubscriber(dash_type) {

    if (this.subscribers && !this.subscribers.find(el => el == dash_type) !== undefined) {
      this.subscribers.push(dash_type);
      return true;
    }
    return false;
  }

  public getSubscribers(){
    return this.subscribers;
  }

  getStringToastr(title: boolean, message: boolean, nome_file, nome_toastr) {
    this.value = this.langObj.value;

    //Stampa del messaggio
    if (!title && message) {
      var tmp = this.value[nome_file];
      var tmp_2 = tmp[nome_toastr];
      var out = tmp_2['MESSAGE'];
      return out;
    }

    //Stampa del titolo
    if (title && !message) {
      var tmp = this.value[nome_file];
      var tmp_2 = tmp[nome_toastr];
      var out = tmp_2['TITLE'];
      return out;
    }

    //Stampa error
    if ((!title && !message) ||
      (title && message)
    ){
      console.warn('ERROR!');
      return null;
    }

  }

  public isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loadingScreen: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public langObj: BehaviorSubject<any> = new BehaviorSubject(null);
  public saveLanguage: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // TODO delete this subjects
  public removeFromDashboard: BehaviorSubject<[number, number]> = new BehaviorSubject<[number, number]>([0, 0]);
  public updateChartInDashboard: BehaviorSubject<DashboardCharts> = new BehaviorSubject<DashboardCharts>(null);
  public showChartInDashboard: BehaviorSubject<DashboardCharts> = new BehaviorSubject<DashboardCharts>(null);
  public updateChartList: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public dragAndDrop: BehaviorSubject<boolean> = new BehaviorSubject<boolean>( false);

  public draggable = this.dragAndDrop.asObservable();
}
