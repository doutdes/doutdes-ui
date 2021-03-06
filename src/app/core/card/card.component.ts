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
import {BehaviorSubject, forkJoin, Observable, Subject} from 'rxjs';
import {retry, takeUntil} from 'rxjs/operators';
import {FilterActions} from '../../features/dashboard/redux-filter/filter.actions';
import {Chart} from '../../shared/_models/Chart';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../shared/_services/user.service';
import {User} from '../../shared/_models/User';
import {IntervalDate} from '../../features/dashboard/redux-filter/filter.model';
import {subDays} from "date-fns";
import {HttpClient} from '@angular/common/http';
import {select} from '@angular-redux/store';
import {ChartsCallsService} from '../../shared/_services/charts_calls.service';
import {InstagramService} from '../../shared/_services/instagram.service';
import {ChartParams} from '../../shared/_models/Chart';
//import {EmptycardComponent} from './emptycard.component';

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

  @select() filter: Observable<any>;

  public FILTER_DAYS = {
    yesterday: 1,
    seven: 7,
    eight: 8,
    thirty: 29,
    ninety: 89,
  };

  tmpProva: ['ciao', 'wee'];

  styles: any;
  formatID = [];
  tmpFormat;

  aggregated: boolean;
  type: string;
  avg: string;
  high: string;
  low: string;
  tot: string;
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
  bannedChart = [101, 117];
  nPost = 0;

  dateChoice: String = null;

  maxDate_30: Date = subDays(new Date(), this.FILTER_DAYS.yesterday);

  maxDate: Date = subDays(new Date(), this.FILTER_DAYS.yesterday);

  updateGraph: any;

  bsRangeValue: Date[];
  bsRangeValue2: Date[];
  intervalFinal = [];
  firstDateRange: Date;
  lastDateRange: Date;
  check_int: number;
  edit_1: boolean;
  edit_2: boolean;

  metrics: Array<Chart>;
  addMetricForm: FormGroup;


  lang: string;
  value: string;
  tmp: string;
  user: User;

  chartRemaining;

  checkComp: boolean;
  checkFormatNew;

  constructor(
    private formBuilder: FormBuilder,
    private IGService: InstagramService,
    private modalService: BsModalService,
    private dashboardService: DashboardService,
    private GEService: GlobalEventsManagerService,
    private DService: DashboardService,
    private CCService: ChartsCallsService,
    private toastr: ToastrService,
    private filterActions: FilterActions,
    public translate: TranslateService,
    private userService: UserService,
    private http: HttpClient,
   // private addChart: EmptycardComponent,
  ) {
    this.GEService.draggable.subscribe(value => this.drag = value);

    this.userService.get().subscribe(value => {
      this.user = value;

      this.http.get('./assets/langSetting/langToastr/' + this.conversionSetDefaultLang() + '.json')
        .subscribe(file => {
          this.GEService.langObj.next(file);
        }, error => {
          console.error(error);
        });
    });

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

    if (this.dashChart.chart_id == 108) return this.checkMinMaxDate(this.dashChart.chart_id);

    this.dashboardService.getChartsNotAddedByDashboardType(this.dashChart.dashboard_id, this.dashChart.type).subscribe(value => {
      this.styles = value;
    });

    //this.getStyles();

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

    if (this.dashChart.chart_id === 103 || this.dashChart.chart_id === 104) {
      this.dashChart.chartData.dataTable.forEach(el => {
        if (typeof el[1] !== 'string' && el[1] !== 0) {
          this.nPost += parseInt(el[2].slice(el[2].indexOf('post') - 2, el[2].indexOf('post') - 1), 10);
        }});
    }

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
      this.tot = this.dashChart.aggregated.tot.toFixed(2);
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

  updateStyles(card) {

    let tmpNewIDCard = this.checkIDCardByFormat(card.originalTitle, card.format);
    let tmpNewFormat = this.checkFormatNew;

    const chart: DashboardCharts = {
      dashboard_id: card.dashboard_id,
      chart_id: tmpNewIDCard,
      title: card.title,
      format: tmpNewFormat,
      description: card.description,
      //period: card.period
      //position: this.dashChart.position
    };

    if (card.format != tmpNewFormat) {
      this.dashboardService.updateStyleChart(chart)
        .subscribe(() => {
          //this.filterActions.updateStylesChart(chart);
          this.closeModal();

          this.toastr.success(this.GEService.getStringToastr(false, true, 'CARD', 'SI_UPDATE_FORMAT'),
            this.GEService.getStringToastr(true, false, 'CARD', 'SI_UPDATE_FORMAT'));

          location.reload();
        }, error => {

          this.toastr.error(this.GEService.getStringToastr(false, true, 'CARD', 'NO_UPDATE_FORMAT'),
            this.GEService.getStringToastr(true, false, 'CARD', 'NO_UPDATE_FORMAT'));

          console.log('Error updating the Chart');
          console.log(error);
        });
    } else {

      this.toastr.error(this.GEService.getStringToastr(false, true, 'CARD', 'NO_UPDATE_FORMAT_1'),
        this.GEService.getStringToastr(true, false, 'CARD', 'NO_UPDATE_FORMAT_1'));

    }

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

    const intervalDate: IntervalDate = {
      first: this.checkBsRangeValue(1, this.bsRangeValue, this.bsRangeValue2),
      last: this.checkBsRangeValue(2, this.bsRangeValue, this.bsRangeValue2),
    };

    if (check == 'Interval1' && value) {
      this.intervalFinal[0] = [value[0], value[1]];
    }

    if (check == 'Interval2' && value) {
      this.intervalFinal[1] = [value[0], value[1]];
    }

    if (!value && check == 'Edit') {

      try {

        this.GEService.ComparisonIntervals.next(this.intervalFinal);
        this.intervalFinal = [];
        this.closeModal();

        this.filterActions.filterData(intervalDate); //Dopo aver aggiunto un grafico, li porta tutti alla stessa data

        //this.toastr.success('Gli intervalli sono stati aggiornati con successo!', 'Aggiornamento completato!');
        this.toastr.success(this.GEService.getStringToastr(false, true, 'CARD', 'SI_UPDATE_INTERVAL'),
          this.GEService.getStringToastr(true, false, 'CARD', 'SI_UPDATE_INTERVAL'));

      } catch (e) {
        console.error(e);

        //this.toastr.error('Non è stato possibile aggiornare gli intervalli. Riprova oppure contatta il supporto.', 'Errore intervalli!');
        this.toastr.error(this.GEService.getStringToastr(false, true, 'CARD', 'NO_UPDATE_INTERVAL'),
          this.GEService.getStringToastr(true, false, 'CARD', 'NO_UPDATE_INTERVAL'));
      }

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

  checkMinMaxDate (IDChart): any {
    let n = 0;

    for (let i = 0; i < this.filterActions.currentDashboard.data.length; i++) {
      if (this.filterActions.currentDashboard.data[i].chart_id === IDChart) {
        n = i;
        i = this.filterActions.currentDashboard.data.length;
      }
    }

    let tmp = this.filterActions.currentDashboard.data[n].chartData.length;
    let minDate: Date = subDays(this.maxDate_30, tmp);

    this.firstDateRange = minDate;
    this.lastDateRange = this.maxDate;
    this.bsRangeValue = [this.firstDateRange, this.lastDateRange];

    this.firstDateRange = minDate;
    this.lastDateRange = this.maxDate;
    this.bsRangeValue2 = [this.firstDateRange, this.lastDateRange];

    this.check_int = 0;

  }

  conversionSetDefaultLang() {

    switch (this.user.lang) {
      case 'it' :
        this.value = 'Italiano';
        break;
      case 'en' :
        this.value = 'English';
        break;
      default:
        this.value = 'Italiano';
    }

    return this.value;
  }

  checkInfo (chart) {

      switch (chart) {
        case 1:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/FanPerGiorno.pdf', '_blank');
          break;
        case 2:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/FanPerPaese.pdf', '_blank');
          break;
        case 3:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/VisualizzazioniPost.pdf', '_blank');
          break;
        case 8:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/FanPerPaese.pdf', '_blank');
          break;
        case 13:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/VisualizzazioniPagina.pdf', '_blank');
          break;
        case 14:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/FanPerPaese.pdf', '_blank');
          break;
        case 15:
          window.open('./././assets/InfoGrafici/GuideSingole/Instagram/Visualizzazioni.pdf', '_blank');
          break;
        case 16:
          window.open('./././assets/InfoGrafici/GuideSingole/Instagram/FollowerGenere_Eta.pdf', '_blank');
          break;
        case 17:
          window.open('./././assets/InfoGrafici/GuideSingole/Instagram/LinguaFollower.pdf', '_blank');
          break;
        case 18:
          window.open('./././assets/InfoGrafici/GuideSingole/Instagram/UtentiUniciRag.pdf', '_blank');
          break;
        case 19:
          window.open('./././assets/InfoGrafici/GuideSingole/Instagram/FollowerCitta.pdf', '_blank');
          break;
        case 20:
          window.open('./././assets/InfoGrafici/GuideSingole/Instagram/FollowerPaese.pdf', '_blank');
          break;
        case 22:
          window.open('./././assets/InfoGrafici/GuideSingole/Instagram/FollowerOnline.pdf', '_blank');
          break;
        case 28:
          window.open('./././assets/InfoGrafici/GuideSingole/Instagram/NuoviFollower.pdf', '_blank');
          break;
        case 29:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/InterazioniTotali.pdf', '_blank');
          break;
        case 30:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/ClickSuiContenuti.pdf', '_blank');
          break;
        case 31:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/CondivisioneDelLuogo.pdf', '_blank');
          break;
        case 32:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/FeedbackNegativi.pdf', '_blank');
          break;
        case 33:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/FanOnlineGiornalieri.pdf', '_blank');
          break;
        case 34:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/Reazioni.pdf', '_blank');
          break;
        case 35:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/NuoviFan.pdf', '_blank');
          break;
        case 36:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/FanCancellati.pdf', '_blank');
          break;
        case 37:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/VisualizzazioniInserzioni.pdf', '_blank');
          break;
        case 38:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/RiproduzioniVideo.pdf', '_blank');
          break;
        case 48:
        case 49:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/Reazioni.pdf', '_blank');
          break;
        case 50:
        case 51:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/AcquisizioneDegliUtenti.pdf', '_blank');
          break;
        case 52:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/VisualizzazioniContenutiPerCitta.pdf', '_blank');
          break;
        case 53:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/VisualizzazioniContenutiPerCitta.pdf', '_blank');
          break;
        case 54:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/VisualizzazioniContenutiPerPaese.pdf', '_blank');
          break;
        case 102:
          window.open('./././assets/InfoGrafici/GuideSingole/Instagram/ClickInfo.pdf', '_blank');
          break;
        case 110:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/FanPerCitta.pdf', '_blank');
          break;
        case 111:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/FanPerGenereEta.pdf', '_blank');
          break;
        case 121:
          window.open('./././assets/InfoGrafici/GuideSingole/Facebook/FanOnlinePerOra.pdf', '_blank');
          break;
        default:
          this.toastr.error(this.GEService.getStringToastr(false, true, 'CARD', 'NO_INFO'),
            this.GEService.getStringToastr(true, false, 'CARD', 'NO_INFO'));
          break;
      }

  }

  checkCardInfo (chart) {

    switch (chart) {
      case 1:
      case 2:
      case 3:
      case 8:
      case 13:
      case 14:
      case 15:
      case 16:
      case 17:
      case 18:
      case 19:
      case 20:
      case 22:
      case 28:
      case 29:
      case 30:
      case 31:
      case 32:
      case 33:
      case 34:
      case 35:
      case 36:
      case 37:
      case 38:
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 102:
      case 110:
      case 111:
      case 121:
        return true;

      default:
        return false;
    }

  }

  checkInfoBoolComp() {

    if (this.dashChart.chart_id == 108) {
      if (this.dashChart.chartData.dataTable[1][0] == 'null') {
        return true;
      } else {
        return false;
      }
    }
    return true;

  }

  getStyles(originalTitle, format) {
      let count = 1;

      this.formatID = [];
      //this.openModal(template);
      if (this.styles) {
        //Ciclo per salvarmi tutti i "format" per quella metrica
        for (let i = 0; i < this.styles.length; i++) {
          if (this.styles[i]['title'] === originalTitle) {
            //this.formatID.push([this.styles[i]['format']]);
            if (this.styles[i]['format']) {
              this.formatID[count] = this.styles[i]['format'];
              count++;
            }
          }
        }
        //this.formatID.unshift([format]);
        this.formatID[0] = format;
        return this.formatID;
      }

  }

  checkFormat(value) {
      this.checkFormatNew = value.target.value;
  }

  checkIDCardByFormat(titleCard, format){

    if (this.checkFormatNew){
      for(let i = 0; i < this.styles.length; i++){
        if((this.styles[i]['format'] === this.checkFormatNew) && (this.styles[i]['title'] === titleCard)){
          return this.styles[i]['ID'];
        }
      }
    } else {
      this.checkFormatNew = format;
    }

  }

}
