import {NgModule} from '@angular/core';
import {FeatureCalendarComponent} from './calendar.component';
import {FeatureCalendarRoutingModule} from './calendar.routing';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {CalendarModule, DateAdapter} from 'angular-calendar';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {CoreModule} from '../../core/core.module';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [
    FeatureCalendarComponent
  ],
  imports: [
    CoreModule,
    CommonModule,
    FeatureCalendarRoutingModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    })
  ],
  providers: [
    BreadcrumbActions
  ],
  exports: [
    FeatureCalendarComponent
  ]
})

export class FeatureCalendarModule { }
