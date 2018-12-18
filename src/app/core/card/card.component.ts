import {Component, HostBinding, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {DashboardCharts} from '../../shared/_models/DashboardCharts';
import {DashboardService} from '../../shared/_services/dashboard.service';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

const enum Type {
  Facebook = 1,
  Google = 2
};

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})

export class CardComponent implements OnInit {
  @Input() dashChart: DashboardCharts;
  @Input() xlOrder: string;
  @Input() lgOrder: string;
  @HostBinding('class') elementClass = 'pt-3';
  @ViewChild('mychart') mychart;

  aggregated: boolean;
  type: string;
  avg: string;
  high: string;
  low: string;

  icon: string;
  background = '#000';
  color = '#fff';
  modalRef: BsModalRef;

  updateChartForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private dashboardService: DashboardService,
    private eventManager: GlobalEventsManagerService) {
  }

  ngOnInit() {

    this.aggregated = this.dashChart.aggregated ? true : false;

    // Handling icon nicknames
    switch (this.dashChart.type) {
      case Type.Facebook: {
        this.icon = 'fa-facebook-f';
        this.background = '#407CA5';
        break;
      }
      case Type.Google: {
        this.icon = 'fab fa-google';
        this.background = '#DB5D43';
        break;
      }
      default: {
        break;
      }
    }

    if (this.aggregated) {
      this.type = this.dashChart.aggregated.type;

      // Formatting extra data, if exists
      if (this.type == 'ga_bounce') {
        this.avg = this.dashChart.aggregated.average ? (this.dashChart.aggregated.average).toFixed(2) : -1;      // Average
        this.low = this.dashChart.aggregated.lowest ? (this.dashChart.aggregated.lowest).toFixed(2) : -1;        // Lowest value
        this.high = this.dashChart.aggregated.highest ? (this.dashChart.aggregated.highest).toFixed(2) : -1;     // Highest value
      }

      if (this.type == 'ga_impressions'){
        this.avg = this.dashChart.aggregated.average ? (this.dashChart.aggregated.average).toFixed(2) : -1;      // Average
        this.low = this.dashChart.aggregated.lowest ? this.dashChart.aggregated.lowest : -1;                                 // Lowest value
        this.high = this.dashChart.aggregated.highest ? this.dashChart.aggregated.highest : -1;                              // Highest value
      }

      if (this.type == 'ga_avgsessionduration') {
        this.avg = this.dashChart.aggregated.average ? (this.dashChart.aggregated.average).toFixed(2) : -1;      // Average
        this.low = this.dashChart.aggregated.lowest ? (this.dashChart.aggregated.lowest).toFixed(2) : -1;        // Lowest value
        this.high = this.dashChart.aggregated.highest ? (this.dashChart.aggregated.highest).toFixed(2) : -1;     // Highest value
      }
    }

    this.updateChartForm = this.formBuilder.group({
      chartTitle: [this.dashChart.title, Validators.compose([Validators.maxLength(30), Validators.required])],
    });
  }

  get f() {
    return this.updateChartForm.controls;
  }

  onSubmit() {
    this.submitted = true;


    if (this.updateChartForm.invalid) {
      this.loading = false;
      return;
    }

    const chart: DashboardCharts = {
      dashboard_id: this.dashChart.dashboard_id,
      chart_id: this.dashChart.chart_id,
      title: this.updateChartForm.value.chartTitle,
      format: this.dashChart.format
    };

    this.loading = true;

    this.updateChart(chart);
  }

  chartResizer(): void {
    this.mychart.redraw();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered'});
  }

  closeModal(): void {
    this.modalRef.hide();
  }

  removeChart(dashboard_id, chart_id): void {
    this.dashboardService.removeChart(dashboard_id, chart_id)
      .subscribe(() => {

        this.eventManager.removeFromDashboard.next([chart_id, dashboard_id]);
        this.closeModal();

      }, error => {
        console.log(error);
        console.log('Cannot delete Chart from dashboard');
      });
  }

  updateChart(toUpdate): void {
    this.dashboardService.updateChart(toUpdate)
      .subscribe(updated => {
        this.eventManager.updateChartInDashboard.next(toUpdate);
        this.closeModal();
      }, error => {
        console.log('Error updating the Chart');
        console.log(error);
      });

  }

}
