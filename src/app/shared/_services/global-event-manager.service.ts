import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class GlobalEventsManagerService {
  public showNavBar: EventEmitter<any> = new EventEmitter();
  public userLogged: EventEmitter<any> = new EventEmitter();
}
