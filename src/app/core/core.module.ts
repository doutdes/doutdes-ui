import {NgModule} from '@angular/core';
import {FooterComponent} from './footer/footer.component';
import {HeaderComponent} from './header/header.component';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {LoginActions} from '../features/authentication/login/login.actions';
import {SidebarComponent} from './sidebar/sidebar.component';
import {BreadcrumbComponent} from './breadcrumb/breadcrumb.component';
import {CardComponent} from './card/card.component';
import {EmptycardComponent} from './card/emptycard.component';
import {BreadcrumbsModule, BreadcrumbsService} from 'ng6-breadcrumbs';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    BreadcrumbComponent,
    CardComponent,
    EmptycardComponent
  ],
  imports: [
    RouterModule,
    SharedModule,
    Ng2GoogleChartsModule,
  ],
  providers: [
    LoginActions,
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    BreadcrumbComponent,
    CardComponent,
    EmptycardComponent,
  ]
})

export class CoreModule { }
