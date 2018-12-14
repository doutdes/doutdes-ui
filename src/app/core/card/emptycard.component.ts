/* Angular components */
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Component, ElementRef, HostBinding, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';

/* External Libraries */
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {BsModalService} from 'ngx-bootstrap/modal';
import {first} from 'rxjs/operators';
import * as _ from 'lodash';

/* Local Services */
import {DashboardService} from '../../shared/_services/dashboard.service';
import {DashboardCharts} from '../../shared/_models/DashboardCharts';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {Chart} from '../../shared/_models/Chart';

@Component({
  selector: 'app-emptycard',
  templateUrl: './emptycard.component.html',
})

export class EmptycardComponent implements OnInit {

  @Input() xlOrder: string;
  @Input() lgOrder: string;
  @Input() dashboard_data: any;
  @HostBinding('class') elementClass = 'col-lg-6 col-xl-4 pt-3';

  @ViewChild('addChart') addChart: ElementRef;
  @ViewChild('noChartsAvailable') noChartsAvailable: ElementRef;

  modalRef: BsModalRef;
  chartSelected: any;

  config = {
    displayKey: 'global', // if objects array passed which key to be displayed defaults to description,
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
    private dashboardService: DashboardService,
    private eventEmitter: GlobalEventsManagerService
  ) {
    this.eventEmitter.removeFromDashboard.subscribe(values => {
      if (values[0] !== 0 && values[1] !== 0) {
        this.updateDropdownOptions().then(result => this.eventEmitter.removeFromDashboard.next([0, 0]));
      }
    });

    this.eventEmitter.updateChartList.subscribe(value => {
      if (value) {
        this.updateDropdownOptions().then(result => this.eventEmitter.updateChartList.next(false));
      }
    });
  }

  ngOnInit() {
    this.elementClass = this.elementClass + ' order-xl-' + this.xlOrder + ' order-lg-' + this.lgOrder;

    this.insertChartForm = this.formBuilder.group({
      chartTitle: ['', Validators.compose([Validators.maxLength(30), Validators.required])],
    });

    this.updateDropdownOptions();
  }

  get f() {
    return this.insertChartForm.controls;
  }

  async openModal() {

    const chartsAvailable = await this.updateDropdownOptions();

    if (chartsAvailable) {
      this.modalRef = this.modalService.show(this.addChart, {class: 'modal-md modal-dialog-centered'});
    } else {
      this.modalRef = this.modalService.show(this.noChartsAvailable, {class: 'modal-md modal-dialog-centered'});
    }
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
    } // If no Chart has been selected, then it shows an error

    if (this.insertChartForm.invalid) {
      this.loading = false;
      return;
    }

    const dashChart: DashboardCharts = {
      dashboard_id: this.dashboard_data.dashboard_id,
      chart_id: this.chartSelected[0].id,
      title: this.insertChartForm.value.chartTitle,
      format: this.chartSelected[0].format
    };

    this.loading = true;

    this.dashboardService.addChartToDashboard(dashChart)
      .pipe(first())
      .subscribe(chartInserted => {
        dashChart.type = this.chartSelected[0].type;

        this.eventEmitter.showChartInDashboard.next(dashChart); // TODO fix this
        this.insertChartForm.reset();
        this.chartSelected = null;

        this.dropdownOptions = this.dropdownOptions.filter(options => options.id !== dashChart.chart_id);

        this.updateDropdownOptions();
        this.closeModal();

      }, error => {
        console.log('Error inserting the Chart in the dashboard');
        console.log(error);
      });

  }

  updateDropdownOptions(): Promise<boolean> {

    // this.chartsAvailable = false;
    this.dropdownOptions = [];

    return new Promise((resolve, reject) => {
      if (this.dashboard_data.dashboard_type !== 0) {

        this.dashboardService.getChartsNotAddedByDashboardType(this.dashboard_data.dashboard_id, this.dashboard_data.dashboard_type)
          .subscribe(chartRemaining => {
            this.populateDropdown(chartRemaining);
            resolve(true);
          }, err => {
            console.log('Error in Chart remaining call');
            console.log(err);
            resolve(false);
          });
      } else {
        this.dashboardService.getChartsNotAdded(this.dashboard_data.dashboard_id)
          .subscribe(chartRemaining => {
            this.populateDropdown(chartRemaining, true);
            resolve(true);
          }, err => {
              console.log('Error in Chart remaining call');
              console.log(err);
              resolve(false);
          });
      }
    });
  }

  selectionChanged($event: any) {
    this.insertChartForm.controls['chartTitle'].setValue($event.value[0].title);
  }

  populateDropdown(charts : Chart[], writeType = false) {

    if (charts) {
      charts.forEach(el => {
        let global = writeType ? this.getStringType(el.Type) + el.Title + ' (' + el.format + ')' : el.Title + ' (' + el.format + ')';
        this.dropdownOptions.push({
          id: el.ID,
          title: el.Title,
          format: el.format,
          type: el.Type,
          global: global
        });
      });

      this.dropdownOptions = _.orderBy(this.dropdownOptions, ['global', 'title', 'id']);
    }
  }

  getStringType(type: number){
    switch (type) {
      case 1:
        return 'FACEBOOK - ';
      case 2:
        return 'GOOGLE - ';
    }
  }

}
