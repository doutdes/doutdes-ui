import {NgModule} from '@angular/core';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {CoreModule} from '../../core/core.module';
import {CommonModule} from '@angular/common';
import {FeatureTutorialRoutingModule} from './tutorial.routing';
import {FeatureTutorialGaComponent} from './google/tutorialGa.component';
import {ModalModule} from 'ngx-bootstrap';
import {FeatureTutorialFbComponent} from './facebook/tutorialFb.component';
import {FeatureTutorialIgComponent} from './instagram/tutorialIg.component';
import {TranslateModule} from '@ngx-translate/core';
import {UserService} from '../../shared/_services/user.service';


@NgModule({
  declarations: [
    FeatureTutorialGaComponent,
    FeatureTutorialFbComponent,
    FeatureTutorialIgComponent
  ],
  imports: [
    CoreModule,
    CommonModule,
    FeatureTutorialRoutingModule,
    ModalModule.forRoot(),
    TranslateModule
  ],
  providers: [
    BreadcrumbActions,
    UserService
  ],
  exports: [
    FeatureTutorialGaComponent
  ]
})

export class FeatureTutorialModule { }
