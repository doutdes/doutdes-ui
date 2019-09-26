import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {CoreModule} from '../../core/core.module';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {FeatureMessageRoutingModule} from './message.routing';
import {FeatureMessageComponent} from './message.component';
import {MatTableModule} from '@angular/material';
import {MessageService} from '../../shared/_services/message.service';

@NgModule({
  declarations: [
    FeatureMessageComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    FeatureMessageRoutingModule,
    MatTableModule
  ],
  providers: [
    BreadcrumbActions,
    MessageService
  ],
  exports: [
    FeatureMessageComponent
  ]
})

export class FeatureMessageModule { }
