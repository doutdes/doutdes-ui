import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {APP_BASE_HREF, HashLocationStrategy, LocationStrategy} from '@angular/common';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { AppComponent } from './app.component';


// Import routing module
import { AppRoutingModule } from './app.routing';

// Import 3rd party components
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { AlertModule } from 'ngx-bootstrap/alert';

import {CoreModule} from './core/core.module';
import {StoreModule} from './shared/store/store.module';
import {StoreService} from './shared/_services/store.service';
import {GlobalEventsManagerService} from './shared/_services/global-event-manager.service';
import {JwtInterceptor} from './shared/jwt.interceptor';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgxLoadingModule} from 'ngx-loading';
import {AuthService, AuthServiceConfig, FacebookLoginProvider, GoogleLoginProvider, LoginOpt} from 'angularx-social-login';

const googleLoginOptions: LoginOpt = {
  scope: 'https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/yt-analytics-monetary.readonly'
}; // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiauth2clientconfig

const fbLoginOptions: LoginOpt = {
  scope: 'read_insights,ads_read,instagram_manage_insights,manage_pages',
  return_scopes: true,
  enable_profile_selector: true
};

let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider('677265943833-pk2h68akq4u3o6elhcupu8bt89qg4cjl.apps.googleusercontent.com', googleLoginOptions)
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider('2465723383501355', fbLoginOptions)
  }
]);

export function provideConfig() {
  return config;
}

@NgModule({
  imports: [
    // BrowserModule,
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
    StoreModule
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
    AuthService,
    StoreService,
    GlobalEventsManagerService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: AuthServiceConfig, useFactory: provideConfig},
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
