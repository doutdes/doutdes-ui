import {Component, OnInit, TemplateRef} from '@angular/core';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {TranslateService} from '@ngx-translate/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {GlobalEventsManagerService} from '../../../shared/_services/global-event-manager.service';
import {DashboardService} from '../../../shared/_services/dashboard.service';
import {FilterActions} from '../../dashboard/redux-filter/filter.actions';
import {User} from '../../../shared/_models/User';
import {UserService} from '../../../shared/_services/user.service';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {lang} from 'moment';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss']
})
export class LanguageComponent implements OnInit {

  modalRef: BsModalRef;
  submitted: boolean;
  check: boolean;
  lang: any;
  value: string;
  tmp: string;
  user: User;

  constructor(
    private breadcrumbActions: BreadcrumbActions,
    private modalService: BsModalService,
    private GEService: GlobalEventsManagerService,
    private DService: DashboardService,
    private router: Router,
    private filterActions: FilterActions,
    private userService: UserService,
    private toastr: ToastrService,
    public translate: TranslateService,
    private http: HttpClient
  ) {
    translate.addLangs(['Italiano', 'English']);

    /**
    const browserLang = translate.getBrowserCultureLang();
    translate.use(browserLang.match(/Italiano|English/) ? browserLang : 'Italiano');
    **/
  }

  ngOnInit() {
    this.addBreadcrumb();
  }

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];
    bread.push(new Breadcrumb('Home', '/'));

    if ((this.GEService.getStringBreadcrumb('PREFERENZE') == null) &&
      this.GEService.getStringBreadcrumb('IMPO_LINGUA') == null) {

      this.userService.get().subscribe(value => {
        this.user = value;

        this.http.get("./assets/langSetting/langBreadcrumb/" + this.conversionSetDefaultLang(this.user.lang) + ".json")
          .subscribe(file => {
            this.GEService.langBread.next(file);
            bread.push(new Breadcrumb(this.GEService.getStringBreadcrumb('PREFERENZE'), '/preferences/'));
            bread.push(new Breadcrumb(this.GEService.getStringBreadcrumb('IMPO_LINGUA'), '/preferences/api-keys'));
          })
      })

    } else {
      bread.push(new Breadcrumb(this.GEService.getStringBreadcrumb('PREFERENZE'), '/preferences/'));
      bread.push(new Breadcrumb(this.GEService.getStringBreadcrumb('IMPO_LINGUA'), '/preferences/api-keys'));
    }

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }

  optionModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered'});
  }

  closeModal() {
    this.submitted = false;
    this.modalRef.hide();
  }

  changeLanguage() {
    //this.GEService.dragAndDrop.next(this.drag);

    this.controlLanguage();
    //this.user.lang = this.lang;
    //this.user.password = null;

    // @ts-ignore
    let user: User = {
      lang: this.lang
    };

    this.userService.update(user)
      .subscribe (
          data => {
            if (data['status']) {

              this.toastr.error(this.GEService.getStringToastr(false, true, "PREFERENCES", 'NO_AGG'),
                this.GEService.getStringToastr(true, false, 'PREFERENCES', 'NO_AGG'));
            } else {
              this.router.navigate(['/'], { replaceUrl: true, });

              this.checkToastrUpdateSuccess(this.lang);
            }
          }, error => {
            console.log(error);
        }
      );

  this.closeModal();

  }

  checkSelect (value) {
    this.lang = value.target.value;
  }

  controlLanguage () {

      switch (this.lang) {
        case "Italiano" :
          this.lang = "it";
          break;
        case "English" :
          this.lang = "en";
          break;
        default:
          this.lang = "it";
      }
  }

  checkToastrUpdateSuccess(lang) {

    this.http.get("./assets/langSetting/langToastr/" + this.conversionSetDefaultLang(lang) + ".json")
      .subscribe(file => {
        this.toastr.success(this.getStringToastrUpdateSuccess(false, true, "PREFERENCES", 'OK_AGG', file),
          this.getStringToastrUpdateSuccess(true, false, 'PREFERENCES', 'OK_AGG', file));

      });
  }

  conversionSetDefaultLang (lang) {

    switch (lang) {
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

  getStringToastrUpdateSuccess(title: boolean, message: boolean, nome_file, nome_toastr, file) {

    //Stampa del messaggio
    if (!title && message) {
      var tmp = file[nome_file];
      var tmp_2 = tmp[nome_toastr];
      var out = tmp_2['MESSAGE'];
      return out;
    }

    //Stampa del titolo
    if (title && !message) {
      var tmp = file[nome_file];
      var tmp_2 = tmp[nome_toastr];
      var out = tmp_2['TITLE'];
      return out;
    }

    //Stampa error
    if ((!title && !message) ||
      (title && message)
    ){
      console.warn('ERROR!');
      return null;
    }

  }

}
