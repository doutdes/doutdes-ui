import {Component, HostBinding, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {DashboardCharts} from '../../shared/_models/DashboardCharts';
import {DashboardService} from '../../shared/_services/dashboard.service';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {first} from 'rxjs/operators';
import {d} from '@angular/core/src/render3';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})

export class CardComponent implements OnInit {
  @Input() background = '#000';
  @Input() icon: string;
  @Input() xlOrder: string;
  @Input() lgOrder: string;
  @Input() dashChart: DashboardCharts;
  @HostBinding('class') elementClass = 'pt-3';
  @ViewChild('mychart') mychart;

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

    // Handling icon nicknames
    switch (this.icon) {
      case 'facebook': {
        this.icon = 'fa-facebook-f';
        this.background = '#407CA5';
        break;
      }
      case 'google': {
        this.icon = 'fab fa-google';
        this.background = '#DB5D43';
        break;
      }
      default: {
        break;
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

    console.log(chart);
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
      .subscribe(deleted => {

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
