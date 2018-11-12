import {Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation} from '@angular/core';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';

@Component({
  selector: 'app-feature-tutorial-facebook',
  templateUrl: './tutorialFb.component.html',
  styleUrls: ['./tutorialFb.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class FeatureTutorialFbComponent implements OnInit, OnDestroy {

  modalRef: BsModalRef;
  imgSrc: string;

  constructor(private breadcrumbActions: BreadcrumbActions,
              private modalService: BsModalService) {
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
    bread.push(new Breadcrumb('Facebook', '/tutorial/facebook/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  openModal(template: TemplateRef<any>, imgNumber) {
    this.modalRef = this.modalService.show(template, {class: 'modal-xl modal-dialog-centered'});

    switch (imgNumber) {

      case 0:
        this.imgSrc = '01-fbDevelopers.png';
        break;
      case 1:
        this.imgSrc = '02-app.png';
        break;
      case 2:
        this.imgSrc = '03-token1.png';
        break;
      case 3:
        this.imgSrc = '04-auth.png';
        break;
      case 4:
        this.imgSrc = '05-accessTool.png';
        break;
      case 5:
        this.imgSrc = '06-extend.png';
        break;
      case 6:
        this.imgSrc = '07-neverExpToken.png';
        break;
      case 7:
        this.imgSrc = '08-finish.png';
        break;
      case 8:
        this.imgSrc = '09-doutdes.png';
        break;
      case 9:
        this.imgSrc = '10-keys.png';
        break;
      case 10:
        this.imgSrc = '11-addKey.png';
        break;
      case 11:
        this.imgSrc = '12-last.png';
        break;
      case 12:
        this.imgSrc = '13-done.png';
        break;
    }
  }

  closeModal(): void {
    this.modalRef.hide();
  }
}
