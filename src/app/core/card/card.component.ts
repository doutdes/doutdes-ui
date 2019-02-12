import {Component, HostBinding, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {DashboardCharts} from '../../shared/_models/DashboardCharts';
import {DashboardService} from '../../shared/_services/dashboard.service';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {GoogleChartInterface} from 'ng2-google-charts/google-charts-interfaces';
import {GoogleChartComponent} from 'ng2-google-charts';

const enum Type {
  Facebook = 1,
  Google = 2,
  Instagram = 3
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
  @ViewChild('mychart') mychart: GoogleChartComponent;

  aggregated: boolean;
  type: string;
  avg: string;
  high: string;
  low: string;
  interval: string;

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
    private GEService: GlobalEventsManagerService) {
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
        this.background = '#FBEEEB';
        this.color = '#DB5D43';
        break;
      }
      case Type.Instagram: {
        this.icon = 'fa-instagram';
        this.background = '#e7008a';
        break;
      }
      default: {
        break;
      }
    }

    if (this.aggregated) {
      this.handleAggregated();
    }

    this.updateChartForm = this.formBuilder.group({
      chartTitle: [this.dashChart.title, Validators.compose([Validators.maxLength(30), Validators.required])],
    });
  }

  get form() {
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
    this.mychart.draw();
  }

  handleAggregated(): void {
    this.type = this.dashChart.aggregated.type;
    this.avg = '';
    this.low = '';
    this.high = '';

    let unit = '';

    switch (this.type) {
      case 'ga_bounce'             :  unit = ' %'; break;
      case 'ga_avgsessionduration' :  unit = ' s'; break;
    }

    if (this.dashChart.aggregated.average) {
      this.avg = this.dashChart.aggregated.average.toFixed(2) + unit;
    }

    if (this.dashChart.aggregated.lowest) {
      this.low = this.type == 'ga_impressions' ? this.dashChart.aggregated.lowest.toFixed(0) + unit : this.dashChart.aggregated.lowest.toFixed(2) + unit;
    }

    if (this.dashChart.aggregated.highest) {
      this.high = this.type == 'ga_impressions' ? this.dashChart.aggregated.highest.toFixed(0) + unit : this.dashChart.aggregated.highest.toFixed(2) + unit;
    }

    //this.interval = 'BASE INTERVAL: ' + new Date(this.dashChart.aggregated.interval.first).toLocaleString() + ' -- ' + new Date(this.dashChart.aggregated.interval.last).toLocaleString() +
    //' | PREVIOUS: ' + new Date(this.dashChart.aggregated.previousInterval.first).toLocaleString() + ' -- ' + new Date(this.dashChart.aggregated.previousInterval.last).toLocaleString();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered'});
  }

  closeModal(): void {
    this.submitted = false;
    this.modalRef.hide();
  }

  removeChart(dashboard_id, chart_id): void {
    this.dashboardService.removeChart(dashboard_id, chart_id)
      .subscribe(() => {
        this.GEService.removeFromDashboard.next([chart_id, dashboard_id]);
        this.closeModal();
      }, error => {
        console.error('ERROR in CARD-COMPONENT. Cannot delete a chart from the dashboard.');
        console.log(error);
      });
  }

  updateChart(toUpdate): void {
    this.dashboardService.updateChart(toUpdate)
      .subscribe(() => {
        this.GEService.updateChartInDashboard.next(toUpdate);
        this.closeModal();
      }, error => {
        console.log('Error updating the Chart');
        console.log(error);
      });

  }

}
