import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {CoreModule} from '../../core/core.module';
import {HomeRoutingModule} from './home.routing';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {HomeComponent} from './home.component';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient} from '@angular/common/http';
import {UserService} from '../../shared/_services/user.service';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    HomeRoutingModule,
    TranslateModule
  ],
  providers: [
    UserService,
    BreadcrumbActions
  ],
  exports: [
    HomeComponent
  ]
})

export class HomeModule { }
