import {Component, OnDestroy, OnInit, ViewChild, QueryList, TemplateRef, ElementRef} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {takeUntil} from 'rxjs/operators';
import {ChartsCallsService} from '../../../../shared/_services/charts_calls.service';
import {forkJoin, Subject} from 'rxjs';
import {ApiKeysService} from '../../../../shared/_services/apikeys.service';
import {Breadcrumb} from '../../../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../../../core/breadcrumb/breadcrumb.actions';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {User} from '../../../../shared/_models/User';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {UserService} from '../../../../shared/_services/user.service';
import {ngxLoadingAnimationTypes} from 'ngx-loading';
import {GlobalEventsManagerService} from '../../../../shared/_services/global-event-manager.service';
import {ToastrService} from 'ngx-toastr';
import {ApiKey} from '../../../../shared/_models/ApiKeys';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {D_TYPE} from '../../../../shared/_models/Dashboard';
import {FacebookMarketingService} from '../../../../shared/_services/facebook-marketing.service';
import {FacebookCampaignsService} from '../../../../shared/_services/facebook-campaigns.service';
import {FbcMiniCards, MiniCard} from '../../../../shared/_models/MiniCard';
import {IntervalDate} from '../../redux-filter/filter.model';
import {ChartParams} from '../../../../shared/_models/Chart';

const PrimaryWhite = '#ffffff';


@Component({
  selector: 'app-feature-dashboard-facebook-campaigns',
  templateUrl: './facebook-campaigns.component.html',
  styleUrls: ['./facebook-campaigns.component.css'],
})


export class FeatureDashboardFacebookCampaignsComponent  implements OnInit, OnDestroy {
  title = 'Facebook Campaigns';
  titleCamp: string;
  titleAdset: string;
  changeDataTitle = 'MARKETING';
  public miniCards: MiniCard[] = FbcMiniCards;
  private pageID = null;

  dashErrors = {
    emptyMiniCards: false,
    noPages: false
  };

  @ViewChild('MatPaginator') paginator: MatPaginator;
  @ViewChild('MatPaginator2') paginator2: MatPaginator;
  @ViewChild('MatPaginator3') paginator3: MatPaginator;

  @ViewChild('reportWait') reportWait;
  @ViewChild('selectView') selectView;

  @ViewChild('MatSort') sort: MatSort;
  @ViewChild('MatSort2') sort2: MatSort;
  @ViewChild('MatSort3') sort3: MatSort;

  displayedColumnsCampaigns: string[] =
    ['name', 'effective_status', 'daily_budget', 'budget_remaining', 'objective', 'buying_type', 'bid_strategy'];

  displayedColumnsAdsets: string[] = ['name', 'effective_status', 'bid_amount' , 'billing_event', 'optimization_goal'];
  displayedColumnsAds: string[] = ['name', 'effective_status'];
  marketingColumns: string[] = ['name', 'reach', 'impressions', 'spend', 'clicks', 'inline_link_clicks', 'cpc', 'cpp', 'ctr'];

  dataCampaigns;
  dataAdsets;
  dataAds;
  supportArray = [];

  modalRef: BsModalRef;
  public config = {
    animationType: ngxLoadingAnimationTypes.threeBounce,
    backdropBackgroundColour: 'rgba(0,0,0,0.1)',
    backdropBorderRadius: '4px',
    primaryColour: PrimaryWhite,
    secondaryColour: PrimaryWhite
  };
  public loading = false;
  loaded = false;
  fbm_page_id;

  /* flags */
  adSets = false;
  ads = false;
  marketing = false;
  clickedAds = false;
  clickedCamp = '';
  clickedAdset = '';
  idCamp = '';

  public D_TYPE = D_TYPE;
  public isApiKeySet = true;

  // Form for init
  selectViewForm: FormGroup;
  loadingForm: boolean;
  pageList = [];
  submitted: boolean;
  user: User;

  constructor(
    private FBCService: FacebookCampaignsService,
    private formBuilder: FormBuilder,
    private CCService: ChartsCallsService,
    private apiKeyService: ApiKeysService,
    private breadcrumbActions: BreadcrumbActions,
    private modalService: BsModalService,
    private userService: UserService,
    private GEService: GlobalEventsManagerService,
    private toastr: ToastrService,
  ) {
    this.userService.get().subscribe(value => {
      this.user = value; });
  }

  async ngOnInit() {
    let key: ApiKey, update, existence;
    this.GEService.loadingScreen.subscribe(value => {
      this.loading = value;
    });

    this.addBreadcrumb();

    try {
      existence = await this.checkExistence();

      if (!existence) { // If the Api Key has not been set yet, then a message is print
        this.isApiKeySet = false;
        return;
      }
      this.fbm_page_id = await this.getPageID();
      if (!this.fbm_page_id) {
        await this.getPagesList();

        if (this.pageList.length === 0) {
          this.dashErrors.noPages = true;
          this.loading = false;
          return;
        }

        if (this.pageList.length === 1) {
          key = {fbm_page_id: this.pageList[0]['id'], service_id: D_TYPE.FBM};
          update = await this.apiKeyService.updateKey(key).toPromise();

          if (!update) {
            return;
          }
        } else {
          this.loading = false;
          this.selectViewForm = this.formBuilder.group({
            fbm_page_id: ['', Validators.compose([Validators.maxLength(20), Validators.required])],
          });

          this.selectViewForm.controls['fbm_page_id'].setValue(this.pageList[0].id);

          this.openModal(this.selectView, true);
          return;
        }
      }
      await this.getPageName();
      this.createForm();

      this.GEService.loadingScreen.subscribe(value => {
        this.loading = value;
      });
      this.dashErrors.emptyMiniCards = await this.loadMiniCards(this.fbm_page_id);

      await this.loadCampaigns();
      this.GEService.loadingScreen.next(false);
      this.userService.logger(6, this.user).subscribe();
    } catch (e) {
      console.error('Error on ngOnInit of Facebook', e);
      /*this.toastr.error(
        'Il caricamento delle campagne non è andato a buon fine. Per favore, riprova oppure contatta il supporto tecnico.',
        'Qualcosa è andato storto!');*/
      this.GEService.loadingScreen.next(false);

    }
  }

  async loadCampaigns() {
    let chartParams: ChartParams = {};
    const dummySubj: Subject<void> = new Subject<void>(); // used to force unsubscription
    this.GEService.loadingScreen.next(true);

    try {
      chartParams = {
        campaignsId: null,
        domain: 'campaigns'
      };

      this.CCService.retrieveChartData(D_TYPE.FBC, chartParams, this.fbm_page_id)
        .pipe(takeUntil(dummySubj))
        .subscribe( data => {
          data = this.CCService.formatTable(data, this.marketing);
          this.dataCampaigns = new MatTableDataSource(data);
          setTimeout(() => this.dataCampaigns.paginator = this.paginator);
          setTimeout(() => this.dataCampaigns.sort = this.sort);

          if (this.dataCampaigns.length === 0) {
            this.toastr.info(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'NO_DATI_TAB'),
              this.GEService.getStringToastr(true, false, 'DASHBOARD', 'NO_DATI_TAB'));
          }
        });

      this.GEService.loadingScreen.next(false);

      this.loaded = true;
    } catch (err) {
      console.log('Error querying the campaigns');
      console.log(err);
      this.GEService.loadingScreen.next(false);

    }
  }

  applyFilter(filterValue: string, table: string) {
    table === 'filterCampaings'
      ? this.dataCampaigns.filter = filterValue.trim().toLowerCase()
      : this.dataAdsets.filter = filterValue.trim().toLowerCase();
  }

  showAdsets = (id: string, name: string): void => {
    let chartParams: ChartParams = {};
    this.clickedCamp = id;
    this.clickedAdset = '';
    this.clickedAds = false;
    this.idCamp = id;
    this.adSets = true;
    this.ads = false;
    this.titleCamp = name;

    const dummySubj: Subject<void> = new Subject<void>(); // used to force unsubscription
    try {
      chartParams = {
        campaignsId: id,
        domain: 'adsets'
      };

      this.CCService.retrieveChartData(D_TYPE.FBC, chartParams, this.fbm_page_id)
        .pipe(takeUntil(dummySubj))
        .subscribe( data => {
          data = this.CCService.formatTable(data, this.marketing);

          this.dataAdsets = new MatTableDataSource(data);
          this.dataAdsets.paginator = this.paginator2;
          this.dataAdsets.sort = this.sort2;
          if (this.dataAdsets.length === 0) {
            this.toastr.info(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'NO_DATI_TAB'),
              this.GEService.getStringToastr(true, false, 'DASHBOARD', 'NO_DATI_TAB'));
          }
        });
    } catch (err) {
      console.log('Error querying the campaigns');
      console.log(err);
    }
  }

  showAds = (id: string, name: string): void => {
    let chartParams: ChartParams = {};
    this.clickedAdset = id;
    this.ads = true;
    const dummySubj: Subject<void> = new Subject<void>(); // used to force unsubscription

    this.titleAdset = name;

    try {
      chartParams = {
        campaignsId: id,
        domain: 'ads'
      };
      this.CCService.retrieveChartData(D_TYPE.FBC, chartParams, this.fbm_page_id)
        .pipe(takeUntil(dummySubj))
        .subscribe( data => {
          if (this.marketing === true) { // info of the status of the campaigns
            this.clickedAds = true;

            this.dataAdsets.data.forEach( d =>
              d['id'] === id
                ? data.data.unshift(d)
                : null
            );

            this.dataAdsets.data = this.CCService.formatTable(data, this.marketing);

          } else { // info of marketing for the campaigns
            data = this.CCService.formatTable(data, this.marketing);
            this.dataAds = new MatTableDataSource(data);
          }
        });
    } catch (err) {
      console.log('Error querying the campaigns');
      console.log(err);
    }
  }

  changeData = (): void => { // switch information of the campaigns (marketing, status)
    this.adSets = false;
    this.ads = false;
    this.clickedAdset = '';
    this.clickedCamp = '';

    if (this.marketing === false) {
      this.marketing = true;
      this.changeDataTitle = 'STATO';

      this.displayedColumnsCampaigns = this.marketingColumns;
      this.displayedColumnsAdsets = this.marketingColumns;
      this.displayedColumnsAds = this.marketingColumns;

      this.supportArray = [];
      this.dataCampaigns.data = this.CCService.formatTable(this.dataCampaigns, this.marketing, this.supportArray);
    } else {
      this.marketing = false;
      this.changeDataTitle = 'MARKETING';

      this.dataCampaigns.data = this.dataCampaigns.data.concat(this.supportArray);

      this.displayedColumnsCampaigns = ['name', 'effective_status', 'daily_budget', 'budget_remaining', 'objective', 'buying_type', 'bid_strategy'];
      this.displayedColumnsAdsets = ['name', 'effective_status', 'bid_amount' , 'billing_event', 'optimization_goal'];
      this.displayedColumnsAds = ['name', 'effective_status'];
    }
  }

  closeTable = (): void => {
    this.adSets = false;
    this.ads = false;
    this.clickedAdset = '';
    this.clickedCamp = '';
  }

  async getPageID() {
    let pageID;

    try {
      pageID = (await this.apiKeyService.getAllKeys().toPromise()).fbm_page_id;
    } catch (e) {
      console.error('getPageID -> error doing the query', e);
    }

    return pageID;
  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }

  addBreadcrumb = (): void => {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Dashboard', '/dashboard/'));
    bread.push(new Breadcrumb('Facebook Campaigns', '/dashboard/facebook/campaigns/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  };

  removeBreadcrumb = (): void => {
    this.breadcrumbActions.deleteBreadcrumb();
  };

  /*async htmltoPDF() {
    const pdf = new jsPDF('p', 'px', 'a4');// 595w x 842h
    const user = await this.getUserCompany();

    const tables = document.querySelectorAll('table');
    const firstTable = await html2canvas(tables[0]);
    let dimRatio = firstTable['width'] > 400 ? 3 : 2;
    let graphsRow = 2;
    let graphsPage = firstTable['width'] > 400 ? 6 : 4;

    let x = 40, y = 40;
    let offset = y - 10;

    let dateObj = new Date(), month = dateObj.getUTCMonth() + 1, day = dateObj.getUTCDate(), year = dateObj.getUTCFullYear();

    this.openModal(this.reportWait, true);

    pdf.setFontSize(8);
    pdf.text(user.company_name, 320, offset);
    pdf.text('P. IVA: ' + user.vat_number, 320, offset + 10);
    pdf.text(user.first_name + ' ' + user.last_name, 320, offset + 20);
    pdf.text(user.address, 320, offset + 30);
    pdf.text(user.zip + ' - ' + user.city + ' (' + user.province + ')', 320, offset + 40);

    pdf.setFontSize(18);
    pdf.text('REPORT DASHBOARD SITO', x, y - 5);
    y += 20;

    pdf.setFontSize(14);
/!*
    pdf.text('Periodo: ' + this.formatStringDate(this.bsRangeValue[0]) + ' - ' + this.formatStringDate(this.bsRangeValue[1]), x, y - 8);
*!/
    y += 40;

    // Numero grafici per riga dipendente da dimensioni grafico
    for (let i = 0; i < tables.length; i++) {
      const canvas = await html2canvas(tables[i]);
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      if (i !== 0 && i % graphsRow === 0 && i !== graphsPage) {
        y += canvas.height / dimRatio + 20;
        x = 40;
      }

      if (i !== 0 && i % graphsPage === 0) {
        pdf.addPage();
        x = 40;
        y = 20;
      }

      pdf.addImage(imgData, x, y, canvas.width / dimRatio, canvas.height / dimRatio);
      x += canvas.width / dimRatio + 10;
    }

    pdf.save('report_sito_' + user.username + '_' + day + '-' + month + '-' + year + '.pdf');

    this.closeModal();
  } // TODO pdf*/

  async getUserCompany() {
    return <User> await this.userService.get().toPromise();
  }

  openModal(template: TemplateRef<any> | ElementRef, ignoreBackdrop: boolean = false) {

    this.modalRef = this.modalService.show(template, {
      class: 'modal-md modal-dialog-centered',
      ignoreBackdropClick: ignoreBackdrop,
      keyboard: !ignoreBackdrop
    });
  }

  closeModal() {
    this.modalRef.hide();
  }

  async selectViewSubmit() {
    let update;
    this.submitted = true;

    if (this.selectViewForm.invalid) {
      this.loadingForm = false;
      return;
    }

    const key: ApiKey = {
      fbm_page_id: this.selectViewForm.value.fbm_page_id,
      service_id: D_TYPE.FB
    };

    this.loadingForm = true;

    update = await this.apiKeyService.updateKey(key).toPromise();

    if (update) {
      this.closeModal();
      await this.ngOnInit();
    } else {
      console.error('MANDARE ERRORE');
    }
  }

  async getPagesList() {
    try {
      this.pageList = await this.FBCService.getPages().toPromise();
    } catch (e) {
      console.error('getFbmViewList -> Error doing the query');
    }
  }

  async checkExistence() {
    let response, isPermissionGranted, result = null;

    try {
      this.loading = false;
      response = await this.apiKeyService.checkIfKeyExists(D_TYPE.FBM).toPromise();
      isPermissionGranted = await this.apiKeyService.isPermissionGranted(D_TYPE.FBM).toPromise();
      if (isPermissionGranted.tokenValid) {
        result = response['exists'] && isPermissionGranted['granted'];
      } else {
        this.toastr.error(this.GEService.getStringToastr(false, true, 'DASHBOARD', 'NO_PERMESSI'),
          this.GEService.getStringToastr(true, false, 'DASHBOARD', 'NO_PERMESSI'));      }
      this.loading = true;

    } catch (e) {
      console.error(e);
    }

    return result;
  }

  async loadMiniCards(pageID) {
    let results;
    let empty = false;


    let pageIDs = {};
    pageIDs[D_TYPE.FBC] = pageID;
    const observables = this.CCService.retrieveMiniChartData(D_TYPE.FBC, pageIDs);
    forkJoin(observables).subscribe(miniDatas => {

      for (let i = 0; i < this.miniCards.length; i++) {
        results = this.CCService.formatMiniChartData(miniDatas[0].data, D_TYPE.FBC, this.miniCards[i].measure);

        empty = empty || !results;

        this.miniCards[i].value = results['value'];
        this.miniCards[i].progress = 100 + '%';
        //this.miniCards[i].progress = results['perc'] + '%';
        this.miniCards[i].step = results['step'];
      }
    });

    return empty;

  }

  async getPageName() {
    try {
      this.pageList = await this.FBCService.getPages().toPromise();
      this.title = this.pageList.filter(el => el.id === this.fbm_page_id)[0].name;
    } catch (e) {
      console.error('getFbmViewList -> Error doing the query');
    }
  }

  createForm() {
    this.selectViewForm = this.formBuilder.group({
      fbm_page_id: ['', Validators.compose([Validators.maxLength(20), Validators.required])],
    });
    this.selectViewForm.controls['fbm_page_id'].setValue(this.pageList[0].id);
  }
}



