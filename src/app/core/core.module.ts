import {NgModule} from '@angular/core';
import {FooterComponent} from './footer/footer.component';
import {HeaderComponent} from './header/header.component';
import {Ng2GoogleChartsModule} from 'ng2-google-charts';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {LoginActions} from '../features/authentication/login/login.actions';
import {SidebarComponent} from './sidebar/sidebar.component';
import {BreadcrumbComponent} from './breadcrumb/breadcrumb.component';
import {CardComponent} from './card/card.component';
import {EmptycardComponent} from './card/emptycard.component';
import {BsDropdownModule, BsModalService, ModalModule, PopoverModule} from 'ngx-bootstrap';
import {SelectDropDownModule} from 'ngx-select-dropdown';
import {DashboardService} from '../shared/_services/dashboard.service';
import {MiniCardComponent} from './card/minicard.component';
import {FilterActions} from '../features/dashboard/redux-filter/filter.actions';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {UserService} from '../shared/_services/user.service';
import {FacebookService} from '../shared/_services/facebook.service';
import {FacebookMarketingService} from '../shared/_services/facebook-marketing.service';
import {ApiKeysService} from '../shared/_services/apikeys.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '././assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    BreadcrumbComponent,
    CardComponent,
    EmptycardComponent,
    MiniCardComponent
  ],
  imports: [
    RouterModule,
    SharedModule,
    BsDropdownModule,
    ReactiveFormsModule,
    SelectDropDownModule,
    Ng2GoogleChartsModule,
    ModalModule.forRoot(),
    PopoverModule.forRoot(),
    PopoverModule.forRoot(),
    TranslateModule
  ],
  providers: [
    LoginActions,
    BsModalService,
    UserService,
    DashboardService,
    FilterActions,
    FacebookMarketingService,
    ApiKeysService,
    {provide: 'mapsApiKey', useValue: 'AIzaSyAjKzYOB3pXeI79ONHTp066mDb3xzTtUKc'}
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    BreadcrumbComponent,
    CardComponent,
    EmptycardComponent,
    MiniCardComponent
  ]
})

export class CoreModule { }
