import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {CoreModule} from '../../core/core.module';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {FeatureMessageRoutingModule} from './message.routing';
import {FeatureMessageComponent} from './message.component';
import {MatPaginatorModule, MatTableModule} from '@angular/material';
import {MessageService} from '../../shared/_services/message.service';
import {TranslateModule} from '@ngx-translate/core';


@NgModule({
  declarations: [
    FeatureMessageComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    FeatureMessageRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    TranslateModule
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
