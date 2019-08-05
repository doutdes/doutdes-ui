import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {GlobalEventsManagerService} from './shared/_services/global-event-manager.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {User} from './shared/_models/User';
import {UserService} from './shared/_services/user.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  // tslint:disable-next-line
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
  // templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  drag: boolean;

  data: any;
  user: User;
  lang: string;
  value: string;

  constructor (
    private router: Router,
    private GEservice: GlobalEventsManagerService,
    private http: HttpClient,
    private userService: UserService,
    public translate: TranslateService
  ) {
      this.GEservice.isUserLoggedIn.subscribe(data => {

        if (data) {
          this.userService.get().subscribe(data => {
            this.user = data;
            this.translate.setDefaultLang(this.conversionSetDefaultLang());

            //Per settare la lingua dei toastr
            this.http.get("./assets/langToastr/" + this.conversionSetDefaultLang() + ".json")
              .subscribe(file => {
                this.GEservice.langObj.next(file)
              });

          }, err => {
            console.error(err);
          });
        }
      });
  }

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });

    this.GEservice.dragAndDrop.subscribe(value => this.drag = value);


    this.userService.get().subscribe(data => {
      this.user = data;

      //Per settare la lingua dei toastr
      this.http.get("./assets/langToastr/" + this.conversionSetDefaultLang() + ".json")
        .subscribe(file => {
          this.GEservice.langObj.next(file)
        });
    }, err => {
      console.error(err);
    });

  }

  conversionSetDefaultLang () {

    switch (this.user.lang) {
      case "it" :
        this.value = "Italiano";
        break;
      case "en" :
        this.value = "English";
        break;
      default:
        this.value = "Italiano";
    }

    return this.value;
  }

}
