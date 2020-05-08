import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Breadcrumb} from '../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {TranslateService} from '@ngx-translate/core';
import {browser} from 'protractor';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {StoreService} from '../../shared/_services/store.service';
import {User} from '../../shared/_models/User';
import {UserService} from '../../shared/_services/user.service';
import {ToastrService} from 'ngx-toastr';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {


  modalRef: BsModalRef;
  lang: string;
  value: string;
  tmp: string;
  user: User;
  id: string;

  @ViewChild('newVersion') newVersionTemplate: ElementRef;

  constructor(
    private cookieService: CookieService,
    private modalService: BsModalService,
    private breadcrumbActions: BreadcrumbActions,
    private globalEventService: GlobalEventsManagerService,
    public translate: TranslateService,
    private localStore: StoreService,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    //const browserLang = translate.getBrowserCultureLang();
    //translate.use(browserLang.match(/it|en/) ? browserLang : 'Italiano.json');
  }

  ngOnInit() {
    this.addBreadcrumb();
    this.id = this.localStore.getId();
    const cookieExists: boolean = this.cookieService.check(this.id);
    if (!cookieExists) {
      this.openModal(this.newVersionTemplate);
    }

  }

  ngOnDestroy() {
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

  openModal(modal: ElementRef) {
    this.modalRef = this.modalService.show(modal,
      {
        class: 'modal-md modal-dialog-centered',
        backdrop: 'static',
        keyboard: false
      });
  }

  closeModal() {
    this.cookieService.set(this.id, 'read');
    this.modalRef.hide();
  }
}
