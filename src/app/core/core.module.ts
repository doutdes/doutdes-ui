import {NgModule} from '@angular/core';
import {FooterComponent} from './footer/footer.component';
import {HeaderComponent} from './header/header.component';
// import {AppFooterModule, AppHeaderModule, AppSidebarModule} from '@coreui/angular';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {LoginActions} from '../features/authentication/login/login.actions';
import {SidebarComponent} from './sidebar/sidebar.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent
  ],
  imports: [
    // AppFooterModule,
    // AppHeaderModule,
    RouterModule,
    SharedModule
  ],
  providers: [
    LoginActions
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent
  ]
})

export class CoreModule { }
