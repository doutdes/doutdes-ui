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
import {AggregatedDataService} from '../../shared/_services/aggregated-data.service';

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
  // aggregated data regarding the previous period
  prevAvg: string;
  prevHigh: string;
  prevLow: string;
  // variation (incr/decr) in the given previous-actual interval
  avgShift: string;
  highShift: string;
  lowShift: string;
  icon: string;
  // define if there's a incr/decr/stasis in the value: ==1 if its increasing, ==-1 if it's decreasing, ==0 if there's a stasis
  lowTrend: number;
  highTrend: number;
  avgTrend: number;

  percentual: Boolean;

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
    this.lowTrend = 0;
    this.highTrend = 0;
    this.avgTrend = 0;
    this.percentual = false;

    let unit = '';

    if (this.aggregated) {
      switch (this.dashChart.chart_id) {
        case GA_CHART.BOUNCE_RATE    :
          unit = ' %';
          this.percentual = true;
          this.low = this.dashChart.aggregated.lowest.toFixed(2);
          this.high = this.dashChart.aggregated.highest.toFixed(2);
          this.prevLow = this.dashChart.aggregated.prevLowest.toFixed(2);
          this.prevHigh = this.dashChart.aggregated.prevHighest.toFixed(2);
          break;
        case GA_CHART.AVG_SESS_DURATION :
          unit = ' s';
          this.percentual = false;
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
      this.avg = this.dashChart.aggregated.average.toFixed(2);
      this.prevAvg = this.dashChart.aggregated.prevAverage.toFixed(2);

      let previous: Array<Number>;
      let actual: Array<Number>;

      previous = [];
      actual = [];

      previous.push(parseInt(this.prevHigh, 10));
      previous.push(parseInt(this.prevLow, 10));
      previous.push(parseInt(this.prevAvg, 10));

      actual.push(parseInt(this.high, 10));
      actual.push(parseInt(this.low, 10));
      actual.push(parseInt(this.avg, 10));

      this.low += unit;
      this.high += unit;
      this.avg += unit;
      this.prevLow += unit;
      this.prevHigh += unit;
      this.prevAvg += unit;

      const shift = AggregatedDataService.prototype.calculateShift(actual, previous, this.percentual);
       console.log('SHIFT', shift);

      let factor = 1;
      if (!this.percentual) {
        factor = 100;
      }

      this.avgShift = (shift.avgShift > 1) ?
        ((shift.avgShift.valueOf() - 1) * factor).toFixed(2)
        :
        (factor - (shift.avgShift.valueOf()) * factor).toFixed(2);

      this.highShift = (shift.highShift > 1) ?
        ((shift.highShift.valueOf() - 1) * factor).toFixed(2)
        :
        (factor - (shift.highShift.valueOf()) * factor).toFixed(2);

      this.lowShift = (shift.lowShift > 1) ?
        ((shift.lowShift.valueOf() - 1) * factor).toFixed(2)
        :
        (factor - (shift.lowShift.valueOf()) * factor).toFixed(2);

      if(shift.avgShift === 1) {
        this.avgShift = '100';
      }
      if(shift.highShift === 1) {
        this.highShift = '100';
      }
      if(shift.lowShift === 1) {
        this.lowShift = '100';
      }

      if (shift.avgShift >= 1) {
        this.avgShift = '+ ' + this.avgShift + '%';
        this.avgTrend = 1;
      } else if (shift.avgShift < 1 && shift.avgShift !== 0) {
        this.avgShift = '- ' + this.avgShift + '%';
        this.avgTrend = -1;
      } else {
        this.avgShift = shift.avgShift + '% =';
        this.avgTrend = 0;
      }

      if (shift.highShift >= 1) {
        this.highShift = '+ ' + shift.highShift + '%';
        this.highTrend = 1;
      } else if (shift.highShift < 1 && shift.highShift !== 0) {
        this.highShift = '- ' + Math.abs(shift.highShift).toFixed(2) + '%';
        this.highTrend = -1;
      } else {
        this.highShift = shift.highShift + '% =';
        this.highTrend = 0;
      }

      if (shift.lowShift >= 1) {
        this.lowShift = '+ ' + shift.lowShift + '%';
        this.lowTrend = 1;
      } else if (shift.lowShift < 1 && shift.lowShift !== 0) {
        this.lowShift = '- ' + Math.abs(shift.lowShift).toFixed(2) + '%';
        this.lowTrend = -1;
      } else {
        this.lowShift = shift.lowShift + '% =';
        this.lowTrend = 0;
      }

    }
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
