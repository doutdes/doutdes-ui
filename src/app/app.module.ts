import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { AppComponent } from './app.component';

// Import containers and views
// import { P404Component } from './views/error/404.component';
// import { P500Component } from './views/error/500.component';


// Import routing module
import { AppRoutingModule } from './app.routing';

// Import 3rd party components
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { ReactiveFormsModule } from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { AlertModule } from 'ngx-bootstrap/alert';

import {CoreModule} from './core/core.module';
import {StoreModule} from './shared/store/store.module';
import {StoreService} from './shared/_services/store.service';
import {GlobalEventsManagerService} from './shared/_services/global-event-manager.service';

@NgModule({
  imports: [
    BrowserModule,
    CoreModule,
    ReactiveFormsModule,
    AppRoutingModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ChartsModule,
    HttpClientModule,
    AlertModule.forRoot(),
    StoreModule
  ],
  declarations: [
    AppComponent,
    // P404Component,
    // P500Component,
  ],
  providers: [
    StoreService, GlobalEventsManagerService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
