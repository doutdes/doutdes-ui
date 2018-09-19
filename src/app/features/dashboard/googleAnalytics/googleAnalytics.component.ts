import {Component, OnDestroy, OnInit} from '@angular/core';
import {first} from 'rxjs/internal/operators';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import {GoogleAnalyticsService} from '../../../shared/_services/googleAnalytics.service';

@Component({
  selector: 'app-feature-dashboard-facebook',
  templateUrl: './googleAnalytics.component.html'
})

export class FeatureDashboardGoogleAnalyticsComponent implements OnInit, OnDestroy {

  private breadcrumb: any[];

  public pieChartData = null;

  constructor(private googleAnalyticsService: GoogleAnalyticsService, private breadcrumbActions: BreadcrumbActions) {
  }

  ngOnInit(): void {
    //this.initPieWidget();
  }
  //
  // initPieWidget(): void {
  //   this.googleAnalyticsService.gaBrowsers()
  //     .pipe()
  //     .subscribe(
  //       data => {
  //         const header = [['Browser', 'Sessions']];
  //         const arr = Object.keys().map(
  //       });
  //   this.pieChartData = {
  //     chartType: 'PieChart',
  //     dataTable: header.concat(arr),
  //     options: {
  //       fontSize: 12,
  //       legend: {position: 'labeled', textStyle: {fontSize: 14}},
  //       chartArea: {height: 220, left: 0, right: 0},
  //       height: 250,
  //       sliceVisibilityThreshold: 0.05,
  //       pieHole: 0.15,
  //       is3D: false,
  //       colors: ['#e0440e', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6']
  //     }
  //   };
  //
  // )
  //   ;
  // }
  //
  // addBreadcrumb() {
  //   const bread = [] as Breadcrumb[];
  //
  //   bread.push(new Breadcrumb('Home', '/'));
  //   bread.push(new Breadcrumb('Dashboard', '/dashboard/'));
  //   bread.push(new Breadcrumb('GoogleAnalytics', '/dashboard/googleAnalytics/'));
  //
  //   this.breadcrumbActions.updateBreadcrumb(bread);
  // }
  //
  // removeBreadcrumb() {
  //   this.breadcrumbActions.deleteBreadcrumb();
  // }


  ngOnDestroy() {
    //this.removeBreadcrumb();
  }
}
