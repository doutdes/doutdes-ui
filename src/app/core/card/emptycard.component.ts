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
import {forkJoin, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Chart} from '../../shared/_models/Chart';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../shared/_services/user.service';
import {User} from '../../shared/_models/User';
import {consoleTestResultHandler} from 'tslint/lib/test';
import {HttpClient} from '@angular/common/http';
import {ChartsCallsService} from '../../shared/_services/charts_calls.service';
import {ApiKeysService} from '../../shared/_services/apikeys.service';
import {IntervalDate} from '../../features/dashboard/redux-filter/filter.model';
import {FacebookService} from '../../shared/_services/facebook.service';
import {InstagramService} from '../../shared/_services/instagram.service';

@Component({
  selector: 'app-emptycard',
  templateUrl: './emptycard.component.html'
})

export class EmptycardComponent implements OnInit {

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
  breakdowns = [];
  description: string; // Description of the metric shown

  lang: string;
  value: string;
  tmp: string;
  user: User;
  followers;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private dashboardService: DashboardService,
    private GEService: GlobalEventsManagerService,
    private toastr: ToastrService,
    public translate: TranslateService,
    private http: HttpClient,
    private userService: UserService,
    private CCService: ChartsCallsService,
    private apiKeyService: ApiKeysService,
    private FBService: FacebookService,
    private IGService: InstagramService,
    ) {
    this.userService.get().subscribe(value => {
      this.user = value;
      this.http.get('./assets/langSetting/langStringVarious/' + this.conversionSetDefaultLang() + '.json')
        .subscribe(file => {
          this.GEService.langFilterDate.next(file);
        });
    });
  }

  async ngOnInit() {
    const dashData = this.dashboard_data;

    await this.getFollowers(dashData.dashboard_type);
    this.elementClass = this.elementClass + ' order-xl-' + this.xlOrder + ' order-lg-' + this.lgOrder;

    this.insertChartForm = this.formBuilder.group({
      channel: [this.dashboard_data.dashboard_type],
      break: [null, Validators.required],
      metric: [[], Validators.required],
      style: [null, Validators.required],
      title: [null, Validators.compose([Validators.maxLength(30), Validators.required])],
    });

    if (!dashData) {
      console.error('ERROR in EMPTY-CARD. Cannot get retrieve dashboard data.');
    } else {
      const dummy_dashType = -1; // A dummy dash_type for the emptycard, as event subscriber

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

      if (this.metrics.length === 0) {
        this.toastr.info(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'FULL_GRAF'),
          this.GEService.getStringToastr(true, false, 'DASHBOARD', 'FULL_GRAF'));
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
      chart.type === parseInt(this.insertChartForm.value.channel, 10) &&
      chart.title === this.insertChartForm.value.title &&
      chart.format === this.insertChartForm.value.style
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

    selected.chart_id = selected.ID;
    delete selected['ID'];

    dashChart = {
      ...selected,
      dashboard_id: this.dashboard_data.dashboard_id,
    };

    try {
      await this.dashboardService.addChartToDashboard(dashChart).toPromise();
      this.closeModal();

      this.GEService.showChartInDashboard.next(dashChart);
      this.insertChartForm.reset();

      this.dropdownOptions = this.dropdownOptions.filter(options => options.id !== dashChart.chart_id);

      await this.updateDropdownOptions();
    } catch (error) {
      this.toastr.error(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'NO_ADD'),
        this.GEService.getStringToastr(true, false, 'DASHBOARD', 'NO_ADD'));
      console.error('Error inserting the Chart in the dashboard');
      console.error(error);
    }
  }


  async updateDropdownOptions() {
    let result = false;
    this.channels = [];

    if (this.dashboard_data) {

      this.chartRemaining = this.dashboard_data.dashboard_type !== 0
        ? await this.dashboardService.getChartsNotAddedByDashboardType(this.dashboard_data.dashboard_id, this.dashboard_data.dashboard_type)
          .toPromise()
        : await this.dashboardService.getChartsNotAdded(this.dashboard_data.dashboard_id).toPromise();
      this.chartRemaining = this.chartRemaining.filter(e => (e.countFan === 0) || (e.countFan === 1 && this.followers > 100));




      if (this.chartRemaining && this.chartRemaining.length > 0) {
        this.chartRemaining.sort((a, b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0));
        // Update channels
        if (this.dashboard_data.dashboard_type === D_TYPE.CUSTOM) {
          for (const i in this.dashboard_data.permissions) {
            if (this.dashboard_data.permissions[i]) {
              this.channels.push({name: DS_TYPE[i], value: i});
            }
          }
        } else {
          this.channels.push({name: DS_TYPE[this.dashboard_data.dashboard_type], value: this.dashboard_data.dashboard_type});
        }

            this.insertChartForm.controls['channel'].setValue(this.channels[0].value);
            this.insertChartForm.controls['break'].setValue(this.breakdowns[0]);


        this.filterDropdown(true);

        result = true;
      }

      return result;

    } else {
      console.error('ERROR in EMPTY-CARD. Cannot retrieve dashboard data.');
      return result;
    }

  }

  async getFollowers(type) {
    let pageID;
    let observables;

    switch (type) {
      case D_TYPE.FB:
        pageID = (await this.apiKeyService.getAllKeys().toPromise()).fb_page_id;
        observables = this.FBService.getData('page_fans', pageID);
        forkJoin(observables).subscribe(data => {
            this.followers = data[0][Object.keys(data[0])[Object.keys(data[0]).length - 1]].value;
          });
        break;
      case D_TYPE.IG:
        pageID = (await this.apiKeyService.getAllKeys().toPromise()).ig_page_id;
        observables = this.IGService.getBusinessInfo(pageID);
        forkJoin(observables).subscribe(data => {
          this.followers = data[0]['followers_count'];
          });
        break;
    }
  }


  filterDropdown = (updateChannel = false) => {
    if (updateChannel) {
      // this.breakdowns = this.breakdowns.filter(b => this.chartRemaining.filter(chart => chart.title.includes(b)).length > 0);
      this.chartRemaining.forEach( chart => !this.breakdowns.includes(chart.metric) ? this.breakdowns.push(chart.metric) : null);
      this.insertChartForm.value.break === undefined ? this.insertChartForm.controls['break'].setValue('reach') : null;

      this.metrics = this.getUnique(this.chartRemaining
        .filter(chart => chart.type === parseInt(this.insertChartForm.value.channel, 10))
        .sort((a: Chart, b: Chart) => a.title.localeCompare(b.title)), 'title'
      );

      this.insertChartForm.value.channel === 5
        ? this.metrics = this.metrics.filter(chart => chart.metric === this.insertChartForm.controls['break'].value)
        : null;

      this.insertChartForm.controls['metric'].setValue(this.metrics[0].title);
    }

    // Set the description of the metric
    this.description = (this.chartRemaining.find(chart =>
      chart.title === this.insertChartForm.value.metric && chart.type === parseInt(this.insertChartForm.value.channel, 10)
    )).description;

    // Update styles
    this.styles = this.chartRemaining
      .filter(chart => chart.title === this.insertChartForm.value.metric && chart.type === parseInt(this.insertChartForm.value.channel, 10))
      .map(item => item.format);

    this.insertChartForm.controls['style'].setValue(this.styles[0]);
    // Update title

    this.insertChartForm.controls['title'].setValue(this.insertChartForm.value.metric);

  };

  conversionSetDefaultLang () {

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

  getUnique = (arr, comp) => arr.map(e => e[comp])

    // store the keys of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)

    // eliminate the dead keys & store unique objects
    .filter(e => arr[e]).map(e => arr[e]);

}

