import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Breadcrumb} from '../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {TranslateService} from '@ngx-translate/core';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {StoreService} from '../../shared/_services/store.service';
import {User} from '../../shared/_models/User';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'app-features-tutorialDashboard',
  templateUrl: './tutorialDashboard.component.html'
})
export class tutorialDashboardComponent implements OnInit, OnDestroy {

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
    private localStore: StoreService
  ) { }

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

    /*
    if (this.globalEventService.getStringBreadcrumb('GUIDA_INTRO') == null) {

      this.userService.get().subscribe(value => {
        this.user = value;

        this.http.get("./assets/langSetting/langBreadcrumb/" + this.conversionSetDefaultLang() + ".json")
          .subscribe(file => {
            this.globalEventService.langBread.next(file);
            bread.push(new Breadcrumb(this.globalEventService.getStringBreadcrumb('GUIDA_INTRO'), '/guideIntro/'));
          })
      })

    } else {
      bread.push(new Breadcrumb(this.globalEventService.getStringBreadcrumb('GUIDA_INTRO'), '/guideIntro/'));
    }
    */

    bread.push(new Breadcrumb('Guida Uso', '/tutorialDashboard/'));

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
    this.modalRef.hide();
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
