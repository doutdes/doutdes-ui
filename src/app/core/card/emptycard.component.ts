/* Angular components */
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Component, ElementRef, HostBinding, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';

/* External Libraries */
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {BsModalService} from 'ngx-bootstrap/modal';
import {first} from 'rxjs/operators';

/* Local Services */
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

  @ViewChild('addChart') addChart: ElementRef;
  @ViewChild('noChartsAvailable') noChartsAvailable: ElementRef;

  modalRef: BsModalRef;
  chartSelected: any;

  config = {
    displayKey: 'title', // if objects array passed which key to be displayed defaults to description,
    search: true
  };

  dropdownOptions = [];
  chartsAvailable = false;

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
    this.eventEmitter.removeFromDashboard.subscribe(id => {
      if (id !== 0) {
        this.updateDropdownOptions();
        this.eventEmitter.removeFromDashboard.next(0);
      }
    });
    this.eventEmitter.updateChartList.subscribe(value => {
      if (value) {
        this.updateDropdownOptions();
        this.eventEmitter.updateChartList.next(false);
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

  openModal() {
    if (this.chartsAvailable) {
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
    } // If no chart has been selected, then it shows an error

    if (this.insertChartForm.invalid) {
      this.loading = false;
      return;
    }

    const chart: DashboardCharts = {
      dashboard_id: this.dashboard_data.dashboard_id,
      chart_id: this.chartSelected[0].id,
      title: this.insertChartForm.value.chartTitle,
      format: ''
    };

    this.loading = true;

    this.dashboardService.addChartToDashboard(chart)
      .pipe(first())
      .subscribe(chartInserted => {
        this.eventEmitter.addChartInDashboard.next(chart);
        this.insertChartForm.reset();
        this.chartSelected = null;

        this.dropdownOptions = this.dropdownOptions.filter(options => options.id !== chart.chart_id);

        this.updateDropdownOptions();
        this.closeModal();

      }, error => {
        console.log('Error inserting the chart in the dashboard');
        console.log(error);
      });

  }

  updateDropdownOptions(): void {

    this.chartsAvailable = false;
    this.dropdownOptions = [];

    this.dashboardService.getChartsNotAdded(this.dashboard_data.dashboard_id, this.dashboard_data.dashboard_type)
      .subscribe(chartRemaining => {

        if (chartRemaining) {
          chartRemaining.forEach(el => {
            this.dropdownOptions.push({
              id: el.ID,
              title: el['Title'] + ' (' + el.format + ')',
            });
          });
          this.chartsAvailable = true;
        }

      }, err => {
        console.log('Error in chart remaining call');
        console.log(err);
      });
  }

  selectionChanged($event: any) {
    this.insertChartForm.controls['chartTitle'].setValue($event.value[0].title);
  }

}
