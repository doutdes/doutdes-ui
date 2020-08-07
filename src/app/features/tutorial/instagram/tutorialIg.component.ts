import {Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation} from '@angular/core';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../../shared/_services/user.service';
import {User} from '../../../shared/_models/User';

@Component({
  selector: 'app-feature-tutorial-instagram',
  templateUrl: './tutorialIg.component.html',
  styleUrls: ['./tutorialIg.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class FeatureTutorialIgComponent implements OnInit, OnDestroy {

  modalRef: BsModalRef;
  imgSrc: string;

  lang: string;
  value: string;
  tmp: string;
  user: User;

  constructor(
    private breadcrumbActions: BreadcrumbActions,
    private modalService: BsModalService,
    public translate: TranslateService,
    private userService: UserService
  ) {
    this.translate.addLangs(['Italiano', 'English']);
  }

  ngOnInit(): void {
    this.addBreadcrumb();
  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Tutorial', '/tutorial/'));
    bread.push(new Breadcrumb('Instagram', '/tutorial/instagram/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  openModal(template: TemplateRef<any>, imgNumber) {
    this.modalRef = this.modalService.show(template, {class: 'modal-xl modal-dialog-centered'});

    switch (imgNumber) {
      case 0:
        this.imgSrc = 'chooseService.PNG';
        break;
      case 1:
        this.imgSrc = 'accessi_ig.PNG';
        break;
      case 2:
        this.imgSrc = 'seleziona_ig.PNG';
        break;
      case 3:
        this.imgSrc = 'ig_dash.PNG';
        break;
      case 4:
        this.imgSrc = 'menuIG.png';
        break;
    }
  }

  closeModal(): void {
    this.modalRef.hide();
  }

}
