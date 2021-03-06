import {Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation} from '@angular/core';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../../shared/_services/user.service';
import {User} from '../../../shared/_models/User';

@Component({
  selector: 'app-feature-tutorial-youtube',
  templateUrl: './tutorialYT.component.html',
  styleUrls: ['./tutorialYT.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class FeatureTutorialYTComponent implements OnInit, OnDestroy {

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
    bread.push(new Breadcrumb('YouTube', '/tutorial/youtube/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  openModal(template: TemplateRef<any>, imgNumber) {
    this.modalRef = this.modalService.show(template, {class: 'modal-xl modal-dialog-centered'});

    switch (imgNumber) {
      case 0:
        this.imgSrc = 'chooseService.png';
        break;
      case 1:
        this.imgSrc = 'scegli_youtube.png';
        break;
      case 2:
        this.imgSrc = 'scegli_youtube_2.png';
        break;
      case 3:
        this.imgSrc = 'ytDashboard.png';
        break;
    }
  }

  closeModal(): void {
    this.modalRef.hide();
  }

}
