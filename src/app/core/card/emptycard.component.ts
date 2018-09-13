import {Component, HostBinding, Input, OnInit, TemplateRef} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {BsModalService} from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-emptycard',
  templateUrl: './emptycard.component.html',
  styleUrls: ['./emptycard.component.scss']
})

export class EmptycardComponent implements OnInit {

  @Input() xlOrder: string;
  @Input() lgOrder: string;
  @HostBinding('class') elementClass = 'col-lg-6 col-xl-4 pt-3'; // TODO add order attributes

  modalRef: BsModalRef;
  chartSelected: any;

  config = {
    displayKey: 'description', // if objects array passed which key to be displayed defaults to description,
    search: true
  };

  dropdownOptions = [
    'Fb Page Fans',
    'Geo Chart'
  ];

  constructor(
    private modalService: BsModalService
  ) {

  }

  ngOnInit() {
    this.elementClass = this.elementClass + ' order-xl-' + this.xlOrder + ' order-lg-' + this.lgOrder;
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered'});
  }

  closeModal(): void {
    this.modalRef.hide();
  }
}
