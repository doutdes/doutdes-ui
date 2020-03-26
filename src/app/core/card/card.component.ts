import {Component, ElementRef, HostBinding, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {BsModalRef, BsModalService, parseDate} from 'ngx-bootstrap';
import {DashboardCharts} from '../../shared/_models/DashboardCharts';
import {DashboardService} from '../../shared/_services/dashboard.service';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {GoogleChartComponent} from 'ng2-google-charts';
import {GA_CHART} from '../../shared/_models/GoogleData';
import {D_TYPE} from '../../shared/_models/Dashboard';
import {ToastrService} from 'ngx-toastr';
import {AggregatedDataService} from '../../shared/_services/aggregated-data.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {retry, takeUntil} from 'rxjs/operators';
import {FilterActions} from '../../features/dashboard/redux-filter/filter.actions';
import {Chart} from '../../shared/_models/Chart';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../shared/_services/user.service';
import {User} from '../../shared/_models/User';
import {IntervalDate} from '../../features/dashboard/redux-filter/filter.model';
import {subDays} from "date-fns";

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
  @ViewChild('addMetric') addMetric: ElementRef;

  public FILTER_DAYS = {
    yesterday: 1,
    seven: 7,
    eight: 8,
    thirty: 29,
    ninety: 89,
  };

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
  drag: boolean;

  datePickerEnabled = false; // Used to avoid calling onValueChange() on component init
  dateChoice: String = null;
  /*
  maxDate: Date = subDays(new Date(), this.FILTER_DAYS.yesterday);
  minDate: Date = subDays(this.maxDate, this.FILTER_DAYS.thirty);
  maxDate2: Date = subDays(new Date(), this.FILTER_DAYS.yesterday);
  minDate2: Date = subDays(this.maxDate2, this.FILTER_DAYS.thirty);
   */
  /*
  maxDate: Date = this.checkMinMaxDate(1, 0);
  minDate: Date = this.checkMinMaxDate(1, 1);
  maxDate2: Date = this.checkMinMaxDate(2, 0);
  minDate2: Date = this.checkMinMaxDate(2, 1);
   */

  maxDate: Date;
  minDate: Date;
  maxDate2: Date;
  minDate2: Date;

  bsRangeValue: Date[];
  bsRangeValue2: Date[];
  //set: Date[];
  set1 = [];
  set2 = [];
  intervalFinal = [];
  firstDateRange: Date;
  lastDateRange: Date;

  metrics: Array<Chart>;
  addMetricForm: FormGroup;

  lang: string;
  value: string;
  tmp: string;
  user: User;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private dashboardService: DashboardService,
    private GEService: GlobalEventsManagerService,
    private DService: DashboardService,
    private toastr: ToastrService,
    private filterActions: FilterActions,
    public translate: TranslateService,
  ) {
    this.GEService.draggable.subscribe(value => this.drag = value);
  }

  ngOnInit() {

    this.aggregated = !!this.dashChart.aggregated;

    // Handling icon nicknames
    this.setColorStyle();

    if (this.aggregated) {
      this.handleAggregated();
    }
    this.updateChartForm = this.formBuilder.group({
      chartTitle: [this.dashChart.title, Validators.compose([Validators.maxLength(30), Validators.required])],
    });

    this.firstDateRange = this.minDate;
    this.lastDateRange = this.maxDate;
    this.bsRangeValue = [this.firstDateRange, this.lastDateRange];

    this.firstDateRange = this.minDate2;
    this.lastDateRange = this.maxDate2;
    this.bsRangeValue2 = [this.firstDateRange, this.lastDateRange];

  }

  setColorStyle = (): void => {
    switch (this.dashChart.type) {
      case D_TYPE.FBM:
      case D_TYPE.FBC:
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
      case D_TYPE.YT: {
        this.icon = 'fa-youtube';
        this.background = '#c44e4e';
        this.color = '#bf0000';
        break;
      }
      default: {
        break;
      }
    }
  };

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
      format: this.dashChart.format,
      description: this.dashChart.description
      //position: this.dashChart.position
    };

    this.loading = true;

    this.updateChart(this.dashChart.title, chart);
    console.log('ok');
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

      /*this.avg = this.avg.replace('.', ',');
      this.high = this.high.replace('.', ',');
      this.low = this.low.replace('.', ',');*/

      this.prevLow += unit;
      this.prevHigh += unit;
      this.prevAvg += unit;

      const shift = AggregatedDataService.prototype.calculateShift(actual, previous, this.percentual);

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

      if (shift.avgShift === 1) {
        this.avgShift = '100';
      }
      if (shift.highShift === 1) {
        this.highShift = '100';
      }
      if (shift.lowShift === 1) {
        this.lowShift = '100';
      }

      if (shift.avgShift >= 1) {
        this.avgShift = '+ ' + this.avgShift + '%';
        this.avgTrend = 1;
      } else if (shift.avgShift < 1 && shift.avgShift !== 0) {
        this.avgShift = '- ' + this.avgShift + '%';
        this.avgTrend = -1;
      } else {
        this.avgShift = '0% =';
        this.avgTrend = 0;
      }

      if (shift.highShift >= 1) {
        this.highShift = '+ ' + this.highShift + '%';
        this.highTrend = 1;
      } else if (shift.highShift < 1 && shift.highShift !== 0) {
        this.highShift = '- ' + this.highShift + '%';
        this.highTrend = -1;
      } else {
        this.highShift = '0% =';
        this.highTrend = 0;
      }

      if (shift.lowShift >= 1) {
        this.lowShift = '+ ' + this.lowShift + '%';
        this.lowTrend = 1;
      } else if (shift.lowShift < 1 && shift.lowShift !== 0) {
        this.lowShift = '- ' + this.lowShift + '%';
        this.lowTrend = -1;
      } else {
        this.lowShift = '0% =';
        this.lowTrend = 0;
      }
    }
  }

  openModal(template: ElementRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered'});
  }

  closeModal(): void {
    this.submitted = false;
    this.modalRef.hide();
  }

  removeChart(dashboard_id, chart_id): void {

    let ds: Subject<void> = new Subject<void>(); // used to force unsubscription

    this.dashboardService.removeChart(dashboard_id, chart_id)
      .pipe(takeUntil(ds))
      .subscribe(() => {
        this.filterActions.removeChart(chart_id);
        // this.GEService.removeFromDashboard.next([chart_id, dashboard_id]);
        this.closeModal();
        // this.toastr.success('"' + this.dashChart.title + '" è stato correttamente rimosso.', 'Grafico rimosso correttamente!');

        ds.next();
        ds.complete();
      }, error => {
        this.toastr.error('Non è stato possibile rimuovere "' + this.dashChart.title + '" dalla dashboard. Riprova più tardi oppure contatta il supporto.', 'Errore durante la rimozione del grafico.');
        console.error('ERROR in CARD-COMPONENT. Cannot delete a chart from the dashboard.');
        console.error(error);
      });
  }

  updateChart(title, toUpdate): void {
    this.dashboardService.updateChart(toUpdate)
      .subscribe(() => {
        // this.GEService.updateChartInDashboard.next(toUpdate);
        this.filterActions.updateChart(toUpdate);
        this.closeModal();
        this.toastr.success(
          `"${title}" è stato correttamente rinominato in "${toUpdate.title}"`,
          'Grafico aggiornato correttamente!'
        );
      }, error => {
        this.toastr.error(
          `Non è stato possibile rinominare il grafico "${this.dashChart.title}". Riprova più tardi oppure contatta il supporto.`,
          'Errore durante l\'aggiornamento del grafico.'
        );
        console.log('Error updating the Chart');
        console.log(error);
      });
  }

  addMetricToChart() {
    this.filterActions.addMetric(this.dashChart, this.addMetricForm.controls.metricControl.value);
  }

  getMetricsAvailable() {
    this.dashboardService.getChartsByFormat('linea')
      .subscribe(charts => {
        this.metrics = charts
          .filter(chart => chart.ID !== this.dashChart.chart_id && chart.type === this.dashChart.type)
          .sort((a: Chart, b: Chart) => a.title.localeCompare(b.title));

        this.addMetricForm = this.formBuilder.group({
          metricControl: [this.metrics[0]]
        });

        this.openModal(this.addMetric);
      }, err => {
        console.error(err);
      });
  }

  onValueChange(value, check: string) {

    console.log(this.checkMinMaxDate(1,0));

    this.maxDate = subDays(new Date(), this.FILTER_DAYS.yesterday);
    this.minDate =  subDays(this.maxDate, this.FILTER_DAYS.thirty);
    this.maxDate2 = subDays(new Date(), this.FILTER_DAYS.yesterday);
    this.minDate2 = subDays(this.maxDate2, this.FILTER_DAYS.thirty);

    /*
    this.maxDate = this.checkMinMaxDate(1, 0);
    this.minDate = this.checkMinMaxDate(1, 1);
    this.maxDate2= this.checkMinMaxDate(2, 0);
    this.minDate2 = this.checkMinMaxDate(2, 1);
    */

    const intervalDate: IntervalDate = {
      first: this.checkBsRangeValue(1, this.bsRangeValue, this.bsRangeValue2),
      last: this.checkBsRangeValue(2, this.bsRangeValue, this.bsRangeValue2),
    };


  /*
    if (value && this.datePickerEnabled) {

      const dateInterval: IntervalDate = {
        first: new Date(value[0].setHours(0, 0, 0, 0)),
        last: new Date(value[1].setHours(23, 59, 59))
      };

      this.filterActions.filterData(dateInterval);

      let diff = Math.abs(dateInterval.first.getTime() - dateInterval.last.getTime());
      let diffDays = Math.ceil(diff / (1000 * 3600 * 24)) - 1;

      if (!Object.values(this.FILTER_DAYS).includes(diffDays)) {
        this.dateChoice = 'Personalizzato';
      }

    }
   */

    if (value && (check ==  'Interval1' || check == 'Interval2')) {

      if (check == 'Interval1') {
        this.intervalFinal[0] = [value[0], value[1]];
      }

      if (check == 'Interval2') {
        this.intervalFinal[1] = [value[0], value[1]];
      }
    }

    if (!value && check == 'Edit') {
      this.GEService.ComparisonIntervals.next(this.intervalFinal);
      this.closeModal();
      this.filterActions.filterData(intervalDate); //Dopo aver aggiunto un grafico, li porta tutti alla stessa data
    }

  }

  checkCard(chart) {

    if (chart == 108)
      return true;
    else
      return false;

  }

  checkBsRangeValue (n, bs1, bs2) {
    //first
    if (n == 1) {
      if(parseDate(bs1[0]) < parseDate(bs2[0])) return bs1[0];
      if(parseDate(bs1[0]) > parseDate(bs2[0])) return bs2[0];
      if(parseDate(bs1[0]) == parseDate(bs2[0])) return bs1[0];
  } else {
    //last
      if(parseDate(bs1[1]) > parseDate(bs2[1])) return bs1[1];
      if(parseDate(bs1[1]) < parseDate(bs2[1])) return bs2[1];
      if(parseDate(bs1[1]) == parseDate(bs2[1])) return bs2[1];
    }
  }

  checkMinMaxDate (n_Interval, type_Interval) {

    this.GEService.checkFilterDateIGComparasion.subscribe(data => {
      //Se viene impostato il filtro di "Ultimi 7 giorni"
      if (data == 7) {
        //Intervallo 1
        if (n_Interval == 1) {
          if(type_Interval == 0) return subDays(new Date(), this.FILTER_DAYS.yesterday); //Max
          if(type_Interval == 1) return subDays(this.maxDate, this.FILTER_DAYS.seven); //Min
        } else {
          //Intervallo 2
          if (type_Interval == 0) return subDays(new Date(), this.FILTER_DAYS.yesterday); //Max
          if (type_Interval == 1) return subDays(this.maxDate, this.FILTER_DAYS.seven); //Min
        }
      } else {
        //Se il filtro è impostato ad "Ultimi 30 giorni"
        //Intervallo 1
        if (n_Interval == 1) {
          if(type_Interval == 0) return subDays(new Date(), this.FILTER_DAYS.yesterday); //Max
          if(type_Interval == 1) return subDays(this.maxDate, this.FILTER_DAYS.thirty); //Min
        } else {
          //Intervallo 2
          if (type_Interval == 0) return subDays(new Date(), this.FILTER_DAYS.yesterday); //Max
          if (type_Interval == 1) return subDays(this.maxDate2, this.FILTER_DAYS.thirty); //Min
        }
      }

    }); //End

  }

}
