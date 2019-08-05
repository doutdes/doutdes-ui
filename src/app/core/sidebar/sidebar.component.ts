import {Component} from '@angular/core';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {StoreService} from '../../shared/_services/store.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-core-sidebar',
  templateUrl: './sidebar.component.html',
})

export class SidebarComponent {
  isUserLoggedIn: boolean;
  userType: number;
  drag: boolean;

  constructor(
    private globalEventService: GlobalEventsManagerService,
    private storeService: StoreService
  ) {
      this.globalEventService.isUserLoggedIn.subscribe(value => {
        this.isUserLoggedIn = value;
        this.userType = parseInt(this.storeService.getType());
      });

      //this.drag = this.globalEventService.dragAndDrop.asObservable();

    this.globalEventService.draggable.subscribe(value => {
      //console.warn('HO RICEVUTO ', value);
      this.drag = value
    });

    }

  public checkDrag () {
    if (this.drag) {
      return true;
    } else
      return false;
  }
}
