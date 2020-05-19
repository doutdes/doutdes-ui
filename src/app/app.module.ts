import {NgModule} from '@angular/core';
import {CommonModule, HashLocationStrategy, LocationStrategy} from '@angular/common';

import {DragulaModule} from 'ng2-dragula';

import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';

import {AppComponent} from './app.component';
// Import routing module
import {AppRoutingModule} from './app.routing';
// Import 3rd party components
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {TabsModule} from 'ngx-bootstrap/tabs';
import {ChartsModule} from 'ng2-charts/ng2-charts';
import {ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {AlertModule} from 'ngx-bootstrap/alert';

import {CoreModule} from './core/core.module';
import {StoreModule} from './shared/store/store.module';
import {StoreService} from './shared/_services/store.service';
import {GlobalEventsManagerService} from './shared/_services/global-event-manager.service';
import {JwtInterceptor} from './shared/jwt.interceptor';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToastContainerModule, ToastrModule} from 'ngx-toastr';
import {OverlayModule} from '@angular/cdk/overlay';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {FacebookCampaignsService} from './shared/_services/facebook-campaigns.service';
import {CookieService} from 'ngx-cookie-service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    BrowserAnimationsModule,
    CoreModule,
    ReactiveFormsModule,
    AppRoutingModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ChartsModule,
    HttpClientModule,
    AlertModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      progressBar: true
    }),
    ToastContainerModule,
    StoreModule,
    DragulaModule.forRoot(),
    OverlayModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
    CookieService,
    StoreService,
    GlobalEventsManagerService,
    FacebookCampaignsService,
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: LocationStrategy, useClass: HashLocationStrategy},
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
