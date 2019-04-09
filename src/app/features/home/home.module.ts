import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {CoreModule} from '../../core/core.module';
import {HomeRoutingModule} from './home.routing';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {HomeComponent} from './home.component';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    HomeRoutingModule
  ],
  providers: [
    BreadcrumbActions
  ],
  exports: [
    HomeComponent
  ]
})

export class HomeModule { }
