import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {StoreService} from './store.service';

import {environment} from '../../../environments/environment';
import {Calendar} from '../_models/Calendar';

@Injectable()
export class CalendarService {

  calendarPath = '/calendar/';

  constructor(private http: HttpClient, private storeService: StoreService) {
  }

  getEvents(){
    return this.http.get<Calendar[]>('http://' + environment.host + ':' + environment.port + this.calendarPath + 'getEvents/');
  }

  addEvent(event) {
    return this.http.post('http://' + environment.host + ':' + environment.port + this.calendarPath + 'addEvent/', {event});
  }

  updateEvent(event){
    return this.http.put('http://' + environment.host + ':' + environment.port + this.calendarPath + 'updateEvent/', {event});
  }

  deleteEvent(id) {
    const body = {id: id};

    return this.http.request('delete', 'http://' + environment.host + ':' + environment.port + this.calendarPath + 'deleteEvent/', {
      body
    });
  }

}
