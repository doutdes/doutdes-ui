import {Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation} from '@angular/core';
import {Breadcrumb} from '../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';

@Component({
  selector: 'app-feature-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class FeatureTutorialComponent implements OnInit, OnDestroy {

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

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  openModal(template: TemplateRef<any>, imgNumber) {
    this.modalRef = this.modalService.show(template, {class: 'modal-xl modal-dialog-centered'});

    switch (imgNumber) {

      case 0:
        this.imgSrc = '02-NewProject.png';
        break;
      case 1:
        this.imgSrc = '03-APIEnable.png';
        break;
      case 2:
        this.imgSrc = '04-AnalyticsReporting.png';
        break;
      case 3:
        this.imgSrc = '05-Analytics.png';
        break;
      case 4:
        this.imgSrc = '06-ServiceAccountKey.png';
        break;
      case 5:
        this.imgSrc = '07-JSON.png';
        break;
      case 6:
        this.imgSrc = '08-doutdesPreferences.png';
        break;
      case 7:
        this.imgSrc = '09-AddJSON.png';
        break;
      case 8:
        this.imgSrc = '10-CopyEmail.png';
        break;
      case 9:
        this.imgSrc = '11-analyticsManagment.png';
        break;
      case 10:
        this.imgSrc = '12-AddUser.png';
        break;
      case 11:
        this.imgSrc = '13-addEmail.png';
        break;
      case 12:
        this.imgSrc = '14-end.png';
        break;
    }
  }

  closeModal(): void {
    this.modalRef.hide();
  }
}
