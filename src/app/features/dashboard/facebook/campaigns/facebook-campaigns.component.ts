import {Component, OnDestroy, OnInit, ViewChild, QueryList, TemplateRef, ElementRef} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {takeUntil} from 'rxjs/operators';
import {ChartsCallsService} from '../../../../shared/_services/charts_calls.service';
import {Subject} from 'rxjs';
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
  changeDataTitle = 'Dati marketing campagne';

  @ViewChild('MatPaginator') paginator: MatPaginator;
  @ViewChild('MatPaginator2') paginator2: MatPaginator;
  @ViewChild('MatPaginator3') paginator3: MatPaginator;

  @ViewChild('reportWait') reportWait;

  @ViewChild('MatSort') sort: MatSort;
  @ViewChild('MatSort2') sort2: MatSort;
  @ViewChild('MatSort3') sort3: MatSort;

  dictTranslate = {
    'name': 'Nome',
    'effective_status': 'Stato',
    'daily_budget': 'Budget giornaliero',
    'budget_remaining': 'Budget rimanente',
    'objective': 'Obiettivo',
    'buying_type': 'Tipo acquisto',
    'bid_strategy': 'Strategia di offerta',
    'bid_amount': 'Ammontare offerto',
    'billing_event': 'Fatturazione evento',
    'optimization_goal': 'Obiettivo di ottimizzazione',

    'reach': 'Copertura',
    'impressions': 'Impression',
    'spend': 'Spesa',
    'clicks': 'Numero click',
    'inline_link_clicks': 'Click link',
    'cpc': 'Costo medio per click',
    'cpp': 'Costo medio per copertura',
    'ctr': 'Tasso click su link',

    'ACTIVE': 'Attivo',
    'PAUSED': 'In pausa',
    'DELETED': 'Cancellato',
    'ARCHIVED': 'Archiviato',
    'IN_PROCESS': 'In corso',
    'WITH_ISSUES': 'Con problemi',
    'CAMPAIGN_PAUSED': 'Campagna in pausa',
    'ADSET_PAUSED': 'Adset in pausa',
    'DISAPPROVED': 'Disapprovato',
    'PENDING_REVIEW': 'In attesa di esame',

    'MESSAGES': 'Messaggi',
    'BRAND_AWARENESS': 'Notorietà del brand',
    'REACH': 'Copertura',
    'POST_ENGAGEMENT': 'Interazione post',
    'LINK_CLICKS': 'Click link',
    'LEAD_GENERATION': 'Generazione di contatti',
    'IMPRESSIONS': 'Impression',
    'REPLIES': 'Risposte',
    'PAGE_LIKES': 'Mi piace alla pagina',
    'AD_RECALL_LIFT': 'Notorietà del brand',
    'ENGAGED_REACH': 'Copertura raggiunta', // Da rivedere

    'AUCTION': 'Asta',
    'RESERVED': 'Copertura e frequenza',

    'LOWEST_COST_WITHOUT_CAP': 'Minor costo senza limite offerta',
    'LOWEST_COST_WITH_BID_CAP': 'Minor costo con limite offerta',
    'TARGET_COST': 'Limite costo stabilito',
    'CONVERSIONS': 'Conversioni',
    'VIDEO_VIEWS': 'Visualizzazioni video',
    'EVENT_RESPONSES': 'Reazioni evento',
    'THRUPLAY': 'Visualizzazione effettiva',
  };

  displayedColumnsCampaigns: string[] = ['name', 'effective_status', 'daily_budget', 'budget_remaining', 'objective', 'buying_type', 'bid_strategy'];
  displayedColumnsAdsets: string[] = ['name', 'effective_status', 'bid_amount' , 'billing_event', 'optimization_goal'];
  displayedColumnsAds: string[] = ['name', 'effective_status'];
  marketingColumns: string[] = ['name', 'reach', 'impressions', 'spend', 'clicks', 'inline_link_clicks', 'cpc', 'cpp', 'ctr'];

  dataCampaigns;
  dataAdsets;
  dataAds;

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
  idTables = [101, 102, 103]; // campaign, adset, ad

  /* flags */
  adSets = false;
  ads = false;
  marketing = false;
  clickedAds = false;
  clickedCamp = '';
  clickedAdset = '';
  idCamp = '';

  constructor(
    private CCService: ChartsCallsService,
    private apiKeyService: ApiKeysService,
    private breadcrumbActions: BreadcrumbActions,
    private modalService: BsModalService,
    private userService: UserService,
    private GEService: GlobalEventsManagerService,
    private toastr: ToastrService,
  ) {}

  async ngOnInit() {
    this.loading = true;

    this.addBreadcrumb();
    try {
      this.fbm_page_id = await this.getPageID();

      await this.loadCampaigns();
    } catch (e) {
      console.error('Error on ngOnInit of Facebook', e);
      this.toastr.error(
        'Il caricamento delle campagne non è andato a buon fine. Per favore, riprova oppure contatta il supporto tecnico.',
        'Qualcosa è andato storto!');
      this.loading = false;
    }
  }

  async loadCampaigns() {
    const dummySubj: Subject<void> = new Subject<void>(); // used to force unsubscription
    try {
      this.CCService.retrieveChartData(this.idTables[0], null, this.fbm_page_id)
        .pipe(takeUntil(dummySubj))
        .subscribe( data => {
          data = this.CCService.formatTable(data, this.marketing);

          this.dataCampaigns = new MatTableDataSource(data);
          setTimeout(() => this.dataCampaigns.paginator = this.paginator);
          setTimeout(() => this.dataCampaigns.sort = this.sort);
        });
      this.loading = false;
      this.loaded = true;
    } catch (err) {
      console.log('Error querying the campaigns');
      console.log(err);
      this.loading = false;
    }
  }

  applyFilter(filterValue: string, table: string) {
    table === 'filterCampaings'
      ? this.dataCampaigns.filter = filterValue.trim().toLowerCase()
      : this.dataAdsets.filter = filterValue.trim().toLowerCase();
  }

  showAdsets = (id: string, name: string): void => {
    this.clickedCamp = id;
    this.clickedAdset = '';
    this.clickedAds = false;
    this.idCamp = id;
    this.adSets = true;
    this.ads = false;
    this.titleCamp = name;

    const dummySubj: Subject<void> = new Subject<void>(); // used to force unsubscription
    try {
      this.CCService.retrieveChartData(this.idTables[1], null, this.fbm_page_id, id)
        .pipe(takeUntil(dummySubj))
        .subscribe( data => {
          data = this.CCService.formatTable(data, this.marketing);

          this.dataAdsets = new MatTableDataSource(data);
          this.dataAdsets.paginator = this.paginator2;
          this.dataAdsets.sort = this.sort2;
        });
    } catch (err) {
      console.log('Error querying the campaigns');
      console.log(err);
    }
  }

  showAds = (id: string, name: string): void => {
    const supportArray = [];
    this.clickedAdset = id;
    this.ads = true;
    const dummySubj: Subject<void> = new Subject<void>(); // used to force unsubscription

    this.titleAdset = name;

    try {
      this.CCService.retrieveChartData(this.idTables[2], null, this.fbm_page_id, id)
        .pipe(takeUntil(dummySubj))
        .subscribe( data => {
          if (this.marketing === true) {
            this.clickedAds = true;

            this.dataAdsets.data.forEach( d =>
              d['id'] === id
                ? data.data.unshift(d)
                : null
            );

            this.dataAdsets.data = this.CCService.formatTable(data, this.marketing);

          } else {
            data = this.CCService.formatTable(data, this.marketing);
            this.dataAds = new MatTableDataSource(data);
          }
        });
    } catch (err) {
      console.log('Error querying the campaigns');
      console.log(err);
    }
  }

  changeData = (): void => {
    this.adSets = false;
    this.ads = false;
    this.clickedAdset = '';
    this.clickedCamp = '';

    if (this.marketing === false) {
      this.marketing = true;
      this.changeDataTitle = 'Dati stato campagne';

      this.displayedColumnsCampaigns = this.marketingColumns;
      this.displayedColumnsAdsets = this.marketingColumns;
      this.displayedColumnsAds = this.marketingColumns;

      this.dataCampaigns.data = this.CCService.formatTable(this.dataCampaigns, this.marketing);
    } else {
      this.marketing = false;
      this.changeDataTitle = 'Dati marketing campagne';

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
      pageID = (await this.apiKeyService.getAllKeys().toPromise()).fb_page_id;
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

  async htmltoPDF() {
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
/*
    pdf.text('Periodo: ' + this.formatStringDate(this.bsRangeValue[0]) + ' - ' + this.formatStringDate(this.bsRangeValue[1]), x, y - 8);
*/
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
  } // TODO pdf

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
}



