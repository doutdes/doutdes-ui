/* Angular components */
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
/* External Libraries */
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {BsModalService} from 'ngx-bootstrap/modal';
/* Local Services */
import {DashboardService} from '../../shared/_services/dashboard.service';
import {DashboardCharts} from '../../shared/_models/DashboardCharts';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {D_TYPE, DS_TYPE} from '../../shared/_models/Dashboard';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-emptycard',
  templateUrl: './emptycard.component.html',
})

export class EmptycardComponent implements OnInit, OnDestroy {

  @Input() xlOrder: string;
  @Input() lgOrder: string;
  @Input() dashboard_data: any;
  @HostBinding('class') elementClass = 'col-lg-6 col-xl-6 pt-3';

  @ViewChild('addChart') addChart: ElementRef;
  @ViewChild('noChartsAvailable') noChartsAvailable: ElementRef;

  modalRef: BsModalRef;
  chartRemaining;

  D_TYPE = D_TYPE;

  config = {
    displayKey: 'global', // if objects array passed which key to be displayed defaults to description,
    search: false,
    height: 300
  };

  dropdownOptions = [];
  charts = [];

  insertChartForm: FormGroup;
  loading = false;
  submitted = false;
  chartRequired = false;

  /** Dropdown menus on adding new empty card **/
  channels = [];
  metrics = [];
  styles = [];
  type = [];

  description: string; // Description of the metric shown


  constructor(
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private dashboardService: DashboardService,
    private GEService: GlobalEventsManagerService,
    private toastr: ToastrService
  ) {
  }

  async ngOnInit() {
    const dashData = this.dashboard_data;

    this.elementClass = this.elementClass + ' order-xl-' + this.xlOrder + ' order-lg-' + this.lgOrder;

    this.insertChartForm = this.formBuilder.group({
      channel: [this.dashboard_data.dashboard_type],
      metric: [[], Validators.required],
      style: [null, Validators.required],
      title: [null, Validators.compose([Validators.maxLength(30), Validators.required])],
    });

    if (!dashData) {
      console.error('ERROR in EMPTY-CARD. Cannot get retrieve dashboard data.');
    } else {
      let dummy_dashType = -1; // A dummy dash_type for the emptycard, as event subscriber

      try {
        if (!this.GEService.isSubscriber(dummy_dashType)) {

          this.GEService.removeFromDashboard.subscribe(async values => {
            if (values[0] !== 0 || values[1] !== 0) {
              await this.updateDropdownOptions();
            }
          });

          this.GEService.updateChartList.subscribe(async value => {
            if (value) {
              await this.updateDropdownOptions();
            }
          });

          this.GEService.addSubscriber(dummy_dashType);
        }
      } catch (e) {
        console.error('Error while resolving updateDropdownOptions in EMPTY-CARD.', e);
      }
    }
  }

  get form() {
    return this.insertChartForm.controls;
  }

  async openModal() {

    try {
      await this.updateDropdownOptions();

      if(this.metrics.length === 0) {
        this.toastr.info('Hai già aggiunto tutti i grafici al momento disponibili per questa dashboard.', 'Nessun grafico disponibile');
      } else {
        this.modalService.onHide.subscribe(() => {
          this.closeModal();
        });
        this.modalRef = this.modalService.show(this.addChart, {class: 'modal-md modal-dialog-centered'});
      }

    } catch (err) {
      console.error(err);
    }
  }

  closeModal(): void {
    this.insertChartForm.controls['title'].reset();
    this.submitted = false;
    this.modalRef.hide();
  }

  async onSubmit() {
    let selected, dashChart: DashboardCharts;
    this.submitted = true;
    this.chartRequired = false;

    selected = this.chartRemaining.find(chart =>
      chart.Type == this.insertChartForm.value.channel &&
      chart.Title == this.insertChartForm.value.title &&
      chart.format == this.insertChartForm.value.style
    );

    if (!selected) {
      this.loading = false;
      return;
    }

    if (this.insertChartForm.invalid) {
      this.loading = false;
      return;
    }

    this.loading = true;

    dashChart = {
      chart_id: selected.ID,
      dashboard_id: this.dashboard_data.dashboard_id,
      title: selected.Title,
      type: selected.Type,
      format: selected.format
    };

    try {
      await this.dashboardService.addChartToDashboard(dashChart).toPromise();
      this.closeModal();

      this.GEService.showChartInDashboard.next(dashChart);
      this.insertChartForm.reset();

      this.dropdownOptions = this.dropdownOptions.filter(options => options.id !== dashChart.chart_id);

      await this.updateDropdownOptions();


    } catch (error) {
      this.toastr.error('Non è stato possibile aggiungere "' + dashChart.title + '" alla dashboard. Riprova più tardi oppure contatta il supporto.', 'Errore durante l\'aggiunta del grafico.');
      console.error('Error inserting the Chart in the dashboard');
      console.error(error);
    }
  }

  async updateDropdownOptions() {
    let result = false;
    this.channels = [];

    if (this.dashboard_data) {
      this.chartRemaining = this.dashboard_data.dashboard_type !== 0
        ? await this.dashboardService.getChartsNotAddedByDashboardType(this.dashboard_data.dashboard_id, this.dashboard_data.dashboard_type).toPromise()
        : await this.dashboardService.getChartsNotAdded(this.dashboard_data.dashboard_id).toPromise();

      if (this.chartRemaining && this.chartRemaining.length > 0) {

        // Update channels
        if (this.dashboard_data.dashboard_type === D_TYPE.CUSTOM) {
          for (const i in this.dashboard_data.permissions) {
            if (this.dashboard_data.permissions[i]) this.channels.push({name: DS_TYPE[i], value: i});
          }
        } else {
          this.channels.push({name: DS_TYPE[this.dashboard_data.dashboard_type], value: this.dashboard_data.dashboard_type});
        }

        this.insertChartForm.controls['channel'].setValue(this.channels[0].value);

        this.filterDropdown(true);

        result = true;
      }
    } else {
      console.error('ERROR in EMPTY-CARD. Cannot retrieve dashboard data.');
    }

    return result;
  }

  filterDropdown(updateChannel = false) {
    if (updateChannel) {
      this.metrics = this.getUnique(this.chartRemaining.filter(chart => chart.Type == this.insertChartForm.value.channel), 'Title');
      this.insertChartForm.controls['metric'].setValue(this.metrics[0].Title);
    }

    this.setDescription(this.insertChartForm.value.metric); // Set the description of the metric

    // Update styles
    this.styles = this.chartRemaining.filter(chart => chart.Title == this.insertChartForm.value.metric && chart.Type == this.insertChartForm.value.channel).map(item => item.format);
    this.insertChartForm.controls['style'].setValue(this.styles[0]);

    // Update title
    this.insertChartForm.controls['title'].setValue(this.insertChartForm.value.metric);

    // Set the description of the metric
  }

  getUnique(arr, comp) {
    const unique = arr
      .map(e => e[comp])

      // store the keys of the unique objects
      .map((e, i, final) => final.indexOf(e) === i && i)

      // eliminate the dead keys & store unique objects
      .filter(e => arr[e]).map(e => arr[e]);

    return unique;

  }

  setDescription(metricTitle){
    switch (metricTitle) {
      case 'Fan per giorno':
        this.description = 'Mostra il numero totale giornaliero dei fan della pagina';
        break;
      case 'Fan per Paese':
        this.description = 'Mostra la provenienza geografica dei fan della pagina';
        break;
      case 'Visualizzazioni pagina':
        this.description = 'Numero di visualizzazioni giornaliere della pagina da parte degli utenti';
        break;
      case 'Visualizzazioni post':
        this.description = 'Numero di visualizzazioni giornaliere totali dei post da parte degli utenti';
        break;
      case 'Click sui contenuti':
        this.description = 'Mostra il numero totale di click degli utenti sui contenuti della pagina';
        break;
      case 'Condivisione del luogo':
        this.description = 'Mostra il numero totale di condivisioni del luogo da parte degli utenti della pagina';
        break;
      case 'Feedback negativi':
        this.description = 'Mostra il numero totale dei feedback negativi degli utenti della pagina';
        break;
      case 'Fan Online giornalieri':
        this.description = 'Mostra il numero dei fan online giornalieri che sono utenti della pagina';
         break;
      case 'Nuovi fan':
        this.description = 'Mostra il numero dei nuovi fan che si uniti alla pagina';
        break;
      case 'Fan cancellati':
        this.description = 'Mostra il numero dei fan che si sono cancellati dalla pagina';
        break;
      case 'Visualizzazioni di inserzioni':
        this.description = 'Mostra il numero di visualizzazioni alle inserzioni della pagina';
        break;
      case 'Riproduzioni di video':
        this.description = 'Mostra il numero di riproduzioni dei video presenti nella pagina';
        break;
      case 'Post visualizzati':
        this.description = "Mostra il nuemro di post della pagina visualizzati dagli utenti della pagina";
        break;
      case 'Annunci pub. visualizzati':
        this.description = "Mostra il numero di annunci pubblicitari visualizzati dagli utenti della pagina";
        break;
      case 'Reazioni':
        this.description = "Mostra il numero totale di reazioni che la pagina ha ottenuto";
        break;
      case 'Domini dei referenti esterni ':
        this.description = "Mostra il numero totale delle visite dei principali domini dei referenti esterni che generano traffico sulla pagina.";
        break;
      default:
        this.description = null;
    }
  }

  ngOnDestroy() {
  }
}
