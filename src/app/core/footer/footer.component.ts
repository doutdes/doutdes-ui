import {Component} from '@angular/core';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {UserService} from '../../shared/_services/user.service';
import {TranslateService} from '@ngx-translate/core';
import {User} from '../../shared/_models/User';
import {el} from '@angular/platform-browser/testing/src/browser_util';

@Component({
  selector: 'app-core-footer',
  templateUrl: './footer.component.html',
})

export class FooterComponent {
  copyrightYear = new Date().getFullYear();
  drag: boolean;

  isUserLoggedIn = false;

  lang: string;
  value: string;
  tmp: string;
  user: User;

  constructor (
    private GEservice: GlobalEventsManagerService,
    public translate: TranslateService
    ) { };

  ngOnInit(): void {
    this.GEservice.dragAndDrop.subscribe(value => this.drag = value);

    this.GEservice.isUserLoggedIn.subscribe(value => {
      this.isUserLoggedIn = value;
    }, err => {
      console.error(err);
    });

    if (! this.isUserLoggedIn){
      this.translate.setDefaultLang('Italiano');
    }

  }

}
