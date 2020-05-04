import {Component, OnDestroy, OnInit} from '@angular/core';
import {Breadcrumb} from '../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {TranslateService} from '@ngx-translate/core';
import {browser} from 'protractor';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {StoreService} from '../../shared/_services/store.service';
import {User} from '../../shared/_models/User';
import {UserService} from '../../shared/_services/user.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy{

  lang: string;
  value: string;
  tmp: string;
  user: User;

  constructor(
    private breadcrumbActions: BreadcrumbActions,
    private globalEventService: GlobalEventsManagerService,
    public translate: TranslateService,
    private localStore: StoreService,
    private userService: UserService,
    private toastr: ToastrService
    ){
      //const browserLang = translate.getBrowserCultureLang();
      //translate.use(browserLang.match(/it|en/) ? browserLang : 'Italiano.json');
  }

  ngOnInit(){
    this.addBreadcrumb();
  }

  ngOnDestroy(){
    this.removeBreadcrumb();
  }

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

}
