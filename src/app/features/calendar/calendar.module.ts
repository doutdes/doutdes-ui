import {NgModule} from '@angular/core';
import {FeatureCalendarComponent} from './calendar.component';
import {FeatureCalendarRoutingModule} from './calendar.routing';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {CalendarModule, DateAdapter} from 'angular-calendar';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {CoreModule} from '../../core/core.module';
import {CommonModule, registerLocaleData} from '@angular/common';
import {FlatpickrModule} from 'angularx-flatpickr';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BsModalService} from 'ngx-bootstrap';
import {CalendarService} from '../../shared/_services/calendar.service';
import localeIt from '@angular/common/locales/it';
import {TranslateModule} from '@ngx-translate/core';
import {UserService} from '../../shared/_services/user.service';

registerLocaleData(localeIt);

@NgModule({
  declarations: [
    FeatureCalendarComponent
  ],
  imports: [
    CoreModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FeatureCalendarRoutingModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    TranslateModule
  ],
  providers: [
    BreadcrumbActions,
    CalendarService,
    BsModalService,
    UserService
  ],
  exports: [
    FeatureCalendarComponent
  ]
})

export class FeatureCalendarModule { }
