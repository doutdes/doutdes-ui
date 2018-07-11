import {NgModule} from '@angular/core';
import {FooterComponent} from './footer/footer.component';
import {HeaderComponent} from './header/header.component';
import {AppFooterModule, AppHeaderModule} from '@coreui/angular';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {LoginActions} from '../features/authentication/login/login.actions';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    AppFooterModule,
    AppHeaderModule,
    RouterModule,
    SharedModule
  ],
  providers: [
    LoginActions
  ],
  exports: [
    HeaderComponent,
    FooterComponent
  ]
})

export class CoreModule { }
