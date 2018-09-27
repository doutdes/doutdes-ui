import {Component, HostBinding, Input, OnInit, TemplateRef} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {BsModalService} from 'ngx-bootstrap/modal';
import {ChartsService} from '../../shared/_services/charts.service';
import {first} from 'rxjs/operators';
import {FormBuilder, FormGroup, Validator, Validators} from '@angular/forms';
import {DashboardService} from '../../shared/_services/dashboard.service';
import {DashboardCharts} from '../../shared/_models/DashboardCharts';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';

@Component({
  selector: 'app-emptycard',
  templateUrl: './emptycard.component.html',
})

export class EmptycardComponent implements OnInit {

  @Input() xlOrder: string;
  @Input() lgOrder: string;
  @Input() dashboard_data: any;
  @HostBinding('class') elementClass = 'col-lg-6 col-xl-4 pt-3';

  modalRef: BsModalRef;
  chartSelected: any;

  config = {
    displayKey: 'title', // if objects array passed which key to be displayed defaults to description,
    search: true
  };

  dropdownOptions = [];

  insertChartForm: FormGroup;
  loading = false;
  submitted = false;
  chartRequired = false;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private chartService: ChartsService,
    private dashboardService: DashboardService,
    private eventEmitter: GlobalEventsManagerService
  ) {

  }

  ngOnInit() {
    this.elementClass = this.elementClass + ' order-xl-' + this.xlOrder + ' order-lg-' + this.lgOrder;

    this.chartService.getChartsByType(this.dashboard_data.dashboard_type)
      .pipe(first())
      .subscribe(charts => {
        charts.forEach(el => {
          this.dropdownOptions.push({
            id: el.id,
            title: el.title
          });
        });
      }, error1 => {
        console.log(error1);
        console.log('Error taking charts by type');
      });

    this.insertChartForm = this.formBuilder.group({
      chartTitle: ['', Validators.compose([Validators.maxLength(30), Validators.required])],
    });
  }

  get f() {
    return this.insertChartForm.controls;
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered'});
  }

  closeModal(): void {
    this.modalRef.hide();
  }

  onSubmit() {
    this.submitted = true;
    this.chartRequired = false;

    if (!this.chartSelected) {
      this.chartRequired = true;
      this.loading = false;
      return;
    } // If no chart has been selected, then it shows an error

    if (this.insertChartForm.invalid) {
      this.loading = false;
      return;
    }

    const chart: DashboardCharts = {
        dashboard_id: this.dashboard_data.dashboard_id,
        chart_id: this.chartSelected[0].id,
        title: this.insertChartForm.value.chartTitle,
    };

    this.loading = true;

    this.dashboardService.addChartToDashboard(chart)
      .pipe(first())
      .subscribe(chartInserted => {
        this.eventEmitter.addChartInDashboard.next(chart);
        this.insertChartForm.reset();
        this.chartSelected = null;
        this.closeModal();
      }, error => {
        console.log('Error inserting the chart in the dashboard');
        console.log(error);
      })

  }
}
