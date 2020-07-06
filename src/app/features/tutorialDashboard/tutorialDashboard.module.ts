import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {CoreModule} from '../../core/core.module';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {UserService} from '../../shared/_services/user.service';
import {tutorialDashboardComponent} from './tutorialDashboard.component';
import {TutorialDashboardRoutingModule} from './tutorialDashboard.routing';

@NgModule({
  declarations: [
    tutorialDashboardComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    TutorialDashboardRoutingModule,
    TranslateModule
  ],
  providers: [
    UserService,
    BreadcrumbActions
  ],
  exports: [
    tutorialDashboardComponent
  ]
})

export class FeatureTutorialDashboardModule { }
