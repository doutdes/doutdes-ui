import {Component} from '@angular/core';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {StoreService} from '../../shared/_services/store.service';
import {Observable} from 'rxjs';
import {User} from '../../shared/_models/User';
import {UserService} from '../../shared/_services/user.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-core-sidebar',
  templateUrl: './sidebar.component.html',
})

export class SidebarComponent {
  isUserLoggedIn: boolean;
  userType: number;
  drag: boolean;

  lang: string;
  value: string;
  tmp: string;
  user: User;

  constructor(
    private globalEventService: GlobalEventsManagerService,
    private storeService: StoreService,
    public translate: TranslateService
  ) {
      //this.drag = this.globalEventService.dragAndDrop.asObservable();

    this.globalEventService.draggable.subscribe(value => {
      this.drag = value
    });

    }

  ngOnInit() {
    this.globalEventService.isUserLoggedIn.subscribe(value => {
      this.isUserLoggedIn = value;
      this.userType = parseInt(this.storeService.getType());
    });

    if (! this.isUserLoggedIn) {
      this.translate.setDefaultLang('Italiano');
    }

  }

  public checkDrag () {
    if (this.drag) {
      return true;
    } else
      return false;
  }
}
