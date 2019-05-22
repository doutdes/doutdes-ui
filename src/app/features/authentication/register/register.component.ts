import {Component, OnDestroy, OnInit} from '@angular/core';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';

@Component({
  selector: 'app-feature-authentication-register',
  templateUrl: 'register.component.html'
})
export class FeatureAuthenticationRegisterComponent implements OnInit, OnDestroy{
  constructor(private breadcrumbActions: BreadcrumbActions) { }

  ngOnDestroy(): void {
    this.breadcrumbActions.deleteBreadcrumb();
  }
  ngOnInit(): void {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Registrazione', '/authentication/register'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }
}
