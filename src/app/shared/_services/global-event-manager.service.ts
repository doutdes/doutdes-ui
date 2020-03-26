import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DashboardCharts} from '../_models/DashboardCharts';
import {k} from '@angular/core/src/render3';

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

    // Stampa del messaggio
    if (!title && message) {
      for (const key of Object.keys(this.value)) {
        if (key == nome_file) {
          for (const otherKey of Object.keys(this.value[key])) {
            if (otherKey == nome_toastr) {
              return this.value[key][otherKey]['MESSAGE'];
            }
          }
        }
      }
    }

    // Stampa del titolo
    if (title && !message) {
      for (const key of Object.keys(this.value)) {
        if (key == nome_file) {
          for (const otherKey of Object.keys(this.value[key])) {
            if (otherKey == nome_toastr) {
              return this.value[key][otherKey]['TITLE'];
            }
          }
        }
      }
    }

    // Stampa error
    if ((!title && !message) || (title && message)) {
      console.warn('ERROR!');
      return null;
    }

  }

  getStringBreadcrumb(nome_bread: string) {
    this.value = this.langBread.value;
    if (this.value) {
      return this.value[nome_bread];
    } else {
      return null;
    }
  }

  getStringFilterDate(nome_file: string, nome_key: string) {
    this.value = this.langFilterDate.value;
    if (this.value) {
      for (const key of Object.keys(this.value)) {
        if (key == nome_file) {
          for (const otherKey of Object.keys(this.value[key])) {
            if (otherKey == nome_key) {
              return this.value[key][otherKey];
            }
          }
        }
      }
    } else {
      return null;
    }

  }

  getStringNameMinicard(nome_social: string, nome_minicard: string) {
    this.value = this.langFilterDate.value;

    if (this.value) {
      for (const key of Object.keys(this.value['MINICARD'])) {
        if (key == nome_social) {
          for (const otherKey of Object.keys(this.value['MINICARD'][key])){
            if (otherKey == nome_minicard) {
              return this.value['MINICARD'][key][otherKey];
            }
          }
        }
      }
    } else {
      console.log('ERROR');
      return null;
    }

  }

  public isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loadingScreen: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public langObj: BehaviorSubject<any> = new BehaviorSubject(null); //langToastr
  public langBread: BehaviorSubject<any> = new BehaviorSubject(null); //langBread
  public langFilterDate: BehaviorSubject<any> = new BehaviorSubject(null); //langStringVarious

  public ComparisonIntervals: BehaviorSubject<any> = new BehaviorSubject(null); //ComparasionIntervals
  public checkFilterDateIGComparasion: BehaviorSubject<number> = new BehaviorSubject<number>(null); //checkFilterDateIGComparasion

  // TODO delete this subjects
  public removeFromDashboard: BehaviorSubject<[number, number]> = new BehaviorSubject<[number, number]>([0, 0]);
  public updateChartInDashboard: BehaviorSubject<DashboardCharts> = new BehaviorSubject<DashboardCharts>(null);
  public showChartInDashboard: BehaviorSubject<DashboardCharts> = new BehaviorSubject<DashboardCharts>(null);
  public updateChartList: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public dragAndDrop: BehaviorSubject<boolean> = new BehaviorSubject<boolean>( false);

  public draggable = this.dragAndDrop.asObservable();
}
