/* Angular components */
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
/* External Libraries */
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {BsModalService} from 'ngx-bootstrap/modal';
/* Local Services */
import {DashboardService} from '../../shared/_services/dashboard.service';
import {DashboardCharts} from '../../shared/_models/DashboardCharts';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';
import {D_TYPE, DS_TYPE} from '../../shared/_models/Dashboard';
import {ToastrService} from 'ngx-toastr';
import {T} from '@angular/core/src/render3';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../shared/_services/user.service';
import {User} from '../../shared/_models/User';

@Component({
  selector: 'app-emptycard',
  templateUrl: './emptycard.component.html'
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

  lang: string;
  value: string;
  tmp: string;
  user: User;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private dashboardService: DashboardService,
    private GEService: GlobalEventsManagerService,
    private toastr: ToastrService,
    public translate: TranslateService
  ) { }

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

          this.GEService.removeFromDashboard.subscribe(async values => { // TODO to remove (unuseful)
            if (values[0] !== 0 || values[1] !== 0) {
              await this.updateDropdownOptions();
            }
          });

          this.GEService.updateChartList.subscribe(async value => { // TODO to remove (unuseful)
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
      format: selected.format,
      //position: selected.position
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

          return result;

    } else {
      console.error('ERROR in EMPTY-CARD. Cannot retrieve dashboard data.');
      return result;
    }

  }

  filterDropdown(updateChannel = false) {
    if (updateChannel) {
      this.metrics = this.getUnique(this.chartRemaining.filter(chart => chart.Type == this.insertChartForm.value.channel), 'Title');
      this.insertChartForm.controls['metric'].setValue(this.metrics[0].Title);
    }

    this.description = (this.chartRemaining.find(chart => chart.Title == this.insertChartForm.value.metric && chart.Type == this.insertChartForm.value.channel)).description;

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

  ngOnDestroy() {
  }

}
