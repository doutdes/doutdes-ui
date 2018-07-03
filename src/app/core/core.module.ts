import {NgModule} from '@angular/core';
import {FooterComponent} from './footer/footer.component';
import {HeaderComponent} from './header/header.component';
import {AppFooterModule, AppHeaderModule} from '@coreui/angular';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    AppFooterModule,
    AppHeaderModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent
  ]
})

export class CoreModule { }
