import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {CoreModule} from '../../core/core.module';
import {GuideIntroRoutingModule} from './guideIntro.routing';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {GuideIntroComponent} from './guideIntro.component';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient} from '@angular/common/http';
import {UserService} from '../../shared/_services/user.service';

@NgModule({
  declarations: [
    GuideIntroComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    GuideIntroRoutingModule,
    TranslateModule
  ],
  providers: [
    UserService,
    BreadcrumbActions
  ],
  exports: [
    GuideIntroComponent
  ]
})

export class FeautureGuideIntroModule { }
