import {Component, HostBinding, Input, OnInit, TemplateRef} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {BsModalService} from 'ngx-bootstrap/modal';
import {ChartsService} from '../../shared/_services/charts.service';
import {first} from 'rxjs/operators';

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

  dropdownOptions = [];

  constructor(
    private modalService: BsModalService,
    private chartService: ChartsService
  ) {

  }

  ngOnInit() {
    this.elementClass = this.elementClass + ' order-xl-' + this.xlOrder + ' order-lg-' + this.lgOrder;

    this.chartService.getChartsByType(1)
      .pipe(first())
      .subscribe(charts => {
        charts.forEach(el => {
          this.dropdownOptions.push(el.title);
        });
      }, error1 => {
        console.log(error1);
        console.log('Error taking charts by type');
      });
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered'});
  }

  closeModal(): void {
    this.modalRef.hide();
  }
}
