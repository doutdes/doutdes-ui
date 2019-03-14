import {Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation} from '@angular/core';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';

@Component({
  selector: 'app-feature-tutorial-instagram',
  templateUrl: './tutorialIg.component.html',
  styleUrls: ['./tutorialIg.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class FeatureTutorialIgComponent implements OnInit, OnDestroy {

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
    bread.push(new Breadcrumb('Instagram', '/tutorial/instagram/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  openModal(template: TemplateRef<any>, imgNumber) {
    this.modalRef = this.modalService.show(template, {class: 'modal-xl modal-dialog-centered'});

    switch (imgNumber) {
    }
  }

  closeModal(): void {
    this.modalRef.hide();
  }
}
