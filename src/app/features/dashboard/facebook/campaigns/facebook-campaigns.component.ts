import {Component, OnDestroy, OnInit, ViewChild, QueryList} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {takeUntil} from 'rxjs/operators';
import {ChartsCallsService} from '../../../../shared/_services/charts_calls.service';
import {Subject} from 'rxjs';
import {ApiKeysService} from '../../../../shared/_services/apikeys.service';
import {Breadcrumb} from '../../../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../../../core/breadcrumb/breadcrumb.actions';

@Component({
  selector: 'app-feature-dashboard-facebook-campaigns',
  templateUrl: './facebook-campaigns.component.html',
  styleUrls: ['./facebook-campaigns.component.css'],
})

export class FeatureDashboardFacebookCampaignsComponent  implements OnInit, OnDestroy {
  title = 'Facebook Campaigns';

  @ViewChild('MatPaginator') paginator: MatPaginator;
  @ViewChild('MatPaginator2') paginator2: MatPaginator;

  @ViewChild('MatSort') sort: MatSort;
  @ViewChild('MatSort2') sort2: MatSort;

  displayedColumnsCampaigns: string[] = ['name', 'effective_status', 'daily_budget', 'budget_remaining', 'objective', 'buying_type', 'bid_strategy'];
  displayedColumnsAdsets: string[] = ['name', 'effective_status', 'bid_amount' , 'billing_event', 'optimization_goal'];

  dataCampaigns;
  dataAdsets;
  fbm_page_id;
  adSets = false;

  constructor(
    private CCService: ChartsCallsService,
    private apiKeyService: ApiKeysService,
    private breadcrumbActions: BreadcrumbActions,

  ) {}

  async ngOnInit() {

    const dummySubj: Subject<void> = new Subject<void>(); // used to force unsubscription
    const numeroPerId = 101;
    this.fbm_page_id = await this.getPageID();

    try {
      this.CCService.retrieveChartData(numeroPerId, null, this.fbm_page_id)
        .pipe(takeUntil(dummySubj))
        .subscribe( data => {

          this.dataCampaigns = new MatTableDataSource(data.data);

          this.dataCampaigns.paginator = this.paginator;
          this.dataCampaigns.sort = this.sort;
        });
    }
    catch (err) {
      console.log('Error querying the chart');
      console.log(err);
    }
  }

  applyFilter(filterValue: string, table: string) {
    table === 'c' ? this.dataCampaigns.filter = filterValue.trim().toLowerCase() : this.dataAdsets.filter = filterValue.trim().toLowerCase();
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
    bread.push(new Breadcrumb('Facebook Marketing', '/dashboard/facebook-marketing/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  };

  removeBreadcrumb = (): void => {
    this.breadcrumbActions.deleteBreadcrumb();
  };

  showAdsets = (id: string): void => {
    this.adSets = true;
    const dummySubj: Subject<void> = new Subject<void>(); // used to force unsubscription
    const numeroPerId = 102;

    try {
      this.CCService.retrieveChartData(numeroPerId, null, this.fbm_page_id, id)
        .pipe(takeUntil(dummySubj))
        .subscribe( data => {

          this.dataAdsets = new MatTableDataSource(data.data);

          this.dataAdsets.paginator = this.paginator2;
          this.dataAdsets.sort = this.sort2;
        });
    }
    catch (err) {
      console.log('Error querying the chart');
      console.log(err);
    }
  }
}



/*
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];
*/
