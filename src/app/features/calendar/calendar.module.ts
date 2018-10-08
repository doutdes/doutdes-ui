import {NgModule} from '@angular/core';
import {FeatureCalendarComponent} from './calendar.component';
import {FeatureCalendarRoutingModule} from './calendar.routing';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {CalendarModule, DateAdapter} from 'angular-calendar';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';

@NgModule({
  declarations: [
    FeatureCalendarComponent
  ],
  imports: [
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
