import {Component} from '@angular/core';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {StoreService} from '../../shared/_services/store.service';

@Component({
  selector: 'app-core-sidebar',
  templateUrl: './sidebar.component.html',
})

export class SidebarComponent {
  isUserLoggedIn: boolean;
  userType: number;

  constructor(private globalEventService: GlobalEventsManagerService, private storeService: StoreService) {
    this.globalEventService.isUserLoggedIn.subscribe(value => {
      this.isUserLoggedIn = value;
      this.userType = parseInt(this.storeService.getType());
    });
  }
}
