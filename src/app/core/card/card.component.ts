import {Component, HostBinding, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {DashboardCharts} from '../../shared/_models/DashboardCharts';
import {DashboardService} from '../../shared/_services/dashboard.service';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {GoogleChartComponent} from 'ng2-google-charts';
import {GA_CHART} from '../../shared/_models/GoogleData';
import {D_TYPE} from '../../shared/_models/Dashboard';
import {ToastrService} from 'ngx-toastr';

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
  //aggregated data regarding the previous period
  prevAvg: string;
  prevHigh: string;
  prevLow: string;
  //variation (incr/decr) in the given previous-actual interval
  avgShift: string;
  highShift: string;
  lowShift: string;
  icon: string;
  background = '#000';
  color = '#fff';
  modalRef: BsModalRef;

  updateChartForm: FormGroup;
  loading = false;
  submitted = false;

  D_TYPE = D_TYPE;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private dashboardService: DashboardService,
    private GEService: GlobalEventsManagerService,
    private toastr: ToastrService

  ) {
  }

  ngOnInit() {

    this.aggregated = !!this.dashChart.aggregated;

    // Handling icon nicknames
    switch (this.dashChart.type) {
      case D_TYPE.FB: {
        this.icon = 'fa-facebook-f';
        this.color = '#407CA5';
        this.background = '#e6f6f8';
        break;
      }
      case D_TYPE.GA: {
        this.icon = 'fab fa-google';
        this.background = '#FBEEEB';
        this.color = '#DB5D43';
        break;
      }
      case D_TYPE.IG: {
        this.icon = 'fa-instagram';
        this.background = '#f7e6f1';
        this.color = '#e7008a';
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

    this.updateChart(this.dashChart.title, chart);
  }

  chartResizer(): void {
    this.mychart.draw();
  }

  handleAggregated(): void {
    this.type = this.dashChart.aggregated.type;
    this.avg = '';
    this.low = '';
    this.high = '';
    this.prevAvg = '';
    this.prevHigh = '';
    this.prevLow = '';
    this.avgShift = '';
    this.highShift = '';
    this.lowShift = '';

    let unit = '';

    if (this.aggregated) {
      switch (this.dashChart.chart_id) {
        case GA_CHART.BOUNCE_RATE    :
          unit = ' %';
          this.low = this.dashChart.aggregated.lowest.toFixed(2);
          this.high = this.dashChart.aggregated.highest.toFixed(2);
          this.prevLow = this.dashChart.aggregated.prevLowest.toFixed(2);
          this.prevHigh = this.dashChart.aggregated.prevHighest.toFixed(2);
          break;
        case GA_CHART.AVG_SESS_DURATION :
          unit = ' s';
          this.low = this.dashChart.aggregated.lowest.toFixed(2);
          this.high = this.dashChart.aggregated.highest.toFixed(2);
          this.prevLow = this.dashChart.aggregated.prevLowest.toFixed(2);
          this.prevHigh = this.dashChart.aggregated.prevHighest.toFixed(2);
          break;
        default:
          this.low = this.dashChart.aggregated.lowest;
          this.high = this.dashChart.aggregated.highest;
          this.prevLow = this.dashChart.aggregated.prevLowest;
          this.prevHigh = this.dashChart.aggregated.prevHighest;
          break;
      }

      this.low += unit;
      this.high += unit;
      this.avg = this.dashChart.aggregated.average.toFixed(2) + unit;
      this.prevLow += unit;
      this.prevHigh += unit;
      this.prevAvg = this.dashChart.aggregated.prevAverage.toFixed(2) + unit;
      this.avgShift = this.dashChart.aggregated.avgShift.toFixed(2) + unit;
      this.highShift = this.dashChart.aggregated.highShift.toFixed(2) + unit;
      this.lowShift = this.dashChart.aggregated.lowShift.toFixed(2) + unit;
    }

/*    if(this.aggregated) {

      // if (this.dashChart.aggregated.average) {
      this.avg = this.dashChart.aggregated.average.toFixed(2) + unit;
      // }

      // if (this.dashChart.aggregated.lowest) {
      this.low = (this.dashChart.chart_id === GA_CHART.BOUNCE_RATE ? this.dashChart.aggregated.lowest.toFixed(2) : this.dashChart.aggregated.lowest) + unit;
      // }

      // if (this.dashChart.aggregated.highest) {
      this.high = (this.dashChart.chart_id === GA_CHART.BOUNCE_RATE ? this.dashChart.aggregated.highest.toFixed(2) : this.dashChart.aggregated.highest) + unit;
      // }

      //this.interval = 'BASE INTERVAL: ' + new Date(this.dashChart.aggregated.interval.first).toLocaleString() + ' -- ' + new Date(this.dashChart.aggregated.interval.last).toLocaleString() +
      //' | PREVIOUS: ' + new Date(this.dashChart.aggregated.previousInterval.first).toLocaleString() + ' -- ' + new Date(this.dashChart.aggregated.previousInterval.last).toLocaleString();

    }*/
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
        // this.toastr.success('"' + this.dashChart.title + '" è stato correttamente rimosso.', 'Grafico rimosso correttamente!');
      }, error => {
        this.toastr.error('Non è stato possibile rimuovere "' + this.dashChart.title + '" dalla dashboard. Riprova più tardi oppure contatta il supporto.', 'Errore durante la rimozione del grafico.');
        console.error('ERROR in CARD-COMPONENT. Cannot delete a chart from the dashboard.');
        console.error(error);
      });
  }

  updateChart(title, toUpdate): void {
    this.dashboardService.updateChart(toUpdate)
      .subscribe(() => {
        this.GEService.updateChartInDashboard.next(toUpdate);
        this.closeModal();
        this.toastr.success('"' + title + '" è stato correttamente rinominato in "' + toUpdate.title + '".', 'Grafico aggiornato correttamente!');
      }, error => {
        this.toastr.error('Non è stato possibile rinominare il grafico "' + this.dashChart.title + '". Riprova più tardi oppure contatta il supporto.', 'Errore durante l\'aggiornamento del grafico.');
        console.log('Error updating the Chart');
        console.log(error);
      });

  }

  areAggregatedDataAvailable(chartFormat) {
    return chartFormat == 'linea';
  }


}
